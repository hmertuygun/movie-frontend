import React, { useState, useEffect, useContext } from 'react'
import { InlineInput, Button, Typography } from '../../../components'
import { TradeContext } from '../../context/SimpleTradeContext'
import roundNumbers from '../../../helpers/roundNumbers'
import { useSymbolContext } from '../../context/SymbolContext'
import Slider from 'rc-slider'
import Grid from '@material-ui/core/Grid'

import * as yup from 'yup'

import {
  addPrecisionToNumber,
  removeTrailingZeroFromInput,
  getMaxInputLength,
  getInputLength,
  convertCommaNumberToDot,
  detectEntryPrice,
  allowOnlyNumberDecimalAndComma,
} from '../../../helpers/tradeForm'

import { makeStyles } from '@material-ui/core/styles'

import styles from '../ExitStoplossStopLimit/ExitForm.module.css'

const useStyles = makeStyles({
  root: {
    width: '100%',
    marginBottom: '1rem',
  },
  slider: {
    width: '100%',
    vertiicalAlign: 'middle',
    marginLeft: '8px',
  },
  input: {
    width: 45,
    textAlign: 'right',
    color: 'var(--input-default-color)',
  },
})

const errorInitialValues = {
  price: '',
  quantity: '',
  total: '',
}

const ExitTarget = () => {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolLastPrice,
  } = useSymbolContext()

  const { addTarget, state } = useContext(TradeContext)
  const { entry } = state

  const pricePrecision =
    selectedSymbolDetail['tickSize'] > 8 ? '' : selectedSymbolDetail['tickSize']
  const totalPrecision =
    selectedSymbolDetail['symbolpair'] === 'ETHUSDT'
      ? 7
      : selectedSymbolDetail['quote_asset_precision']
  const quantityPrecision = selectedSymbolDetail['lotSize']
  const profitPercentagePrecision = 2
  const amountPercentagePrecision = 1

  const maxPrice = Number(selectedSymbolDetail.maxPrice)
  const minQty = Number(selectedSymbolDetail.minQty)
  const minNotional = Number(selectedSymbolDetail.minNotional)

  const sumQuantity = state.targets?.map((item) => item.quantity)
  const totalQuantity = sumQuantity?.reduce(
    (total, value) => parseFloat(total) + parseFloat(value),
    0
  )

  const entryPrice = detectEntryPrice(entry, selectedSymbolLastPrice)

  const [values, setValues] = useState({
    price: addPrecisionToNumber(entryPrice, pricePrecision),
    profit: '',
    quantity: '',
    quantityPercentage: '',
    total: '',
  })

  const [errors, setErrors] = useState(errorInitialValues)

  const classes = useStyles()

  const marks = {
    0: '',
    25: '',
    50: '',
    75: '',
    100: '',
  }

  // @TODO
  // Move schema to a different folder
  const formSchema = yup.object().shape({
    price: yup
      .number()
      .required('Price is required')
      .typeError('Price is required')
      .test(
        'Price',
        `Price must be higher than the Entry Price: ${addPrecisionToNumber(
          entryPrice,
          pricePrecision
        )}`,
        (value) => value > entryPrice
      )
      .max(
        maxPrice,
        `Price needs to meet max-price: ${addPrecisionToNumber(
          maxPrice,
          pricePrecision
        )}`
      ),
    quantity: yup
      .number()
      .required('Amount is required')
      .typeError('Amount is required')
      .min(
        minQty,
        `Amount needs to meet min-amount: ${addPrecisionToNumber(
          minQty,
          quantityPrecision
        )}`
      )
      .max(
        entry.quantity,
        `Amount cannot be higher than entry amount: ${entry.quantity}`
      ),
    total: yup
      .number()
      .required('Total is required')
      .typeError('Total is required')
      .min(
        minNotional,
        `Total needs to meet min-trading: ${addPrecisionToNumber(
          minNotional,
          totalPrecision
        )}`
      ),
  })

  const handleSliderChange = (newValue) => {
    setValues((values) => ({
      ...values,
      profit: newValue,
    }))

    priceAndProfitSync('profit', newValue)
  }

  const handleSliderInputChange = ({ target }) => {
    const maxLength = getMaxInputLength(target.value, profitPercentagePrecision)
    const inputLength = getInputLength(target.value)
    if (inputLength > maxLength) return

    const value = !target.value ? '' : Math.abs(target.value)

    const validatedValue = value > 1000 ? 1000 : value

    setValues((values) => ({
      ...values,
      profit: validatedValue,
    }))

    priceAndProfitSync(target.name, validatedValue)
  }

  const handleBlur = ({ target }, precision) => {
    validateInput(target)
    setValues((values) => ({
      ...values,
      [target.name]: addPrecisionToNumber(target.value, precision),
    }))
  }

  const handleQPSliderChange = (newValue) => {
    setValues((values) => ({
      ...values,
      quantityPercentage: newValue,
    }))
    priceAndProfitSync('quantityPercentage', newValue)
  }

  const handleQPInputChange = ({ target }) => {
    const maxLength = getMaxInputLength(target.value, amountPercentagePrecision)
    const inputLength = getInputLength(target.value)
    if (inputLength > maxLength) return

    const value = !target.value
      ? ''
      : removeTrailingZeroFromInput(Math.abs(target.value))

    const validatedValue = value > 100 ? 100 : value

    setValues((values) => ({
      ...values,
      quantityPercentage: validatedValue,
    }))
    priceAndProfitSync(target.name, validatedValue)
  }

  const validateInput = (target) => {
    const isValid = formSchema.fields[target.name]
      .validate(target.value)
      .catch((error) => {
        setErrors((errors) => ({
          ...errors,
          [target.name]: error.message,
        }))
      })

    if (isValid) {
      setErrors((errors) => ({
        ...errors,
        [target.name]: '',
      }))
    }
  }

  const handleChange = ({ target }) => {
    if (!allowOnlyNumberDecimalAndComma(target.value)) return

    const { name, value } = target

    if (name === 'price') {
      const maxLength = getMaxInputLength(target.value, pricePrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return

      const total = addPrecisionToNumber(
        Number(value) * Number(values.quantity),
        totalPrecision
      )

      setValues((values) => ({
        ...values,
        price: value,
        total,
      }))

      priceAndProfitSync(name, value)
    }

    if (name === 'quantity') {
      const maxLength = getMaxInputLength(target.value, quantityPrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return

      const total = addPrecisionToNumber(
        Number(value) * Number(values.price),
        totalPrecision
      )

      setValues((values) => ({
        ...values,
        quantity: value,
        total,
      }))

      priceAndProfitSync(name, value)
    }

    validateInput(target)
  }

  const priceAndProfitSync = (inputName, inputValue) => {
    if (inputName === 'price') {
      const diff = inputValue - entryPrice
      const percentage = (diff / entryPrice) * 100
      const profitPercentage = percentage > 1000 ? 1000 : percentage.toFixed(0)
      setValues((values) => ({
        ...values,
        profit: profitPercentage,
      }))
    }

    if (inputName === 'profit') {
      const derivedPrice = addPrecisionToNumber(
        entryPrice * (1 + inputValue / 100),
        pricePrecision
      )

      const total = addPrecisionToNumber(
        derivedPrice * Number(values.quantity),
        totalPrecision
      )

      setValues((values) => ({
        ...values,
        price: derivedPrice,
        total,
      }))

      validateInput({
        name: 'price',
        value: derivedPrice,
      })

      if (values.price && values.quantity) {
        validateInput({
          name: 'total',
          value: total,
        })
      }
    }

    if (inputName === 'quantity') {
      const percentage = (inputValue / entry.quantity) * 100
      const quantityPercentage = percentage > 100 ? 100 : percentage.toFixed(0)
      setValues((values) => ({
        ...values,
        quantityPercentage,
      }))
    }

    if (inputName === 'quantityPercentage') {
      const theQuantity = (entry.quantity * inputValue) / 100

      const derivedQuantity = addPrecisionToNumber(
        theQuantity,
        quantityPrecision
      )

      const total = addPrecisionToNumber(
        derivedQuantity * Number(values.price),
        totalPrecision
      )

      setValues((values) => ({
        ...values,
        quantity: derivedQuantity,
        total,
      }))

      validateInput({
        name: 'quantity',
        value: derivedQuantity,
      })

      if (values.price && values.quantity) {
        validateInput({
          name: 'total',
          value: total,
        })
      }
    }
  }

  const validateForm = () => {
    return formSchema.validate(values, { abortEarly: false }).catch((error) => {
      if (error.name === 'ValidationError') {
        error.inner.forEach((fieldError) => {
          setErrors((errors) => ({
            ...errors,
            [fieldError.path]: fieldError.message,
          }))
        })
      }
    })
  }

  useEffect(() => {
    if (values.quantity) {
      if (Number(values.quantity) + totalQuantity > entry.quantity) {
        setErrors((errors) => ({
          ...errors,
          total: 'Target orders cannot exceed 100% of entry',
        }))
      } else {
        setErrors((errors) => ({
          ...errors,
          total: '',
        }))
      }
    }
  }, [totalQuantity, values.quantity, values.quantityPercentage])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isFormValid = await validateForm()

    const isLimit = Number(values.quantity) + totalQuantity > entry.quantity

    if (isFormValid && !isLimit) {
      addTarget({
        price: convertCommaNumberToDot(values.price),
        quantity: convertCommaNumberToDot(values.quantity),
        profit: convertCommaNumberToDot(values.profit),
        symbol: selectedSymbolDetail['symbolpair'],
      })

      setValues((values) => ({
        ...values,
        quantityPercentage: '',
        profit: '',
      }))

      setErrors((errors) => ({
        ...errors,
        total: '',
      }))
    } else {
      if (isLimit) {
        setErrors((errors) => ({
          ...errors,
          total: 'Target orders cannot exceed 100% of entry',
        }))
      }
    }
  }

  const renderInputValidationError = (errorKey) => (
    <>
      {errors[errorKey] && (
        <div className={styles['Error']}>{errors[errorKey]}</div>
      )}
    </>
  )

  return (
    <div style={{ marginTop: '2rem' }}>
      <form onSubmit={handleSubmit}>
        <div className={styles['Input']}>
          <InlineInput
            label="Price"
            type="text"
            name="price"
            onChange={handleChange}
            onBlur={(e) => handleBlur(e, pricePrecision)}
            value={values.price}
            placeholder="Target price"
            postLabel={selectedSymbolDetail['quote_asset']}
          />
          {renderInputValidationError('price')}
        </div>
        <div className={classes.root}>
          <div className={styles['SliderRow']}>
            <div className={styles['SliderText']}>
              <Typography className="Slider-Text">Profit</Typography>
            </div>
            <div className={styles['SliderSlider']}>
              <Slider
                defaultValue={0}
                step={1}
                marks={marks}
                min={0}
                max={100}
                onChange={handleSliderChange}
                value={values.profit}
              />
            </div>
            <div className={styles['SliderInput']}>
              <InlineInput
                value={values.profit}
                margin="dense"
                onChange={handleSliderInputChange}
                postLabel={'%'}
                name="profit"
                type="text"
              />
            </div>
          </div>
        </div>
        <div className={styles['Input']}>
          <InlineInput
            label="Quantity"
            type="text"
            name="quantity"
            value={values.quantity}
            onChange={handleChange}
            onBlur={(e) => handleBlur(e, quantityPrecision)}
            postLabel={isLoading ? '' : selectedSymbolDetail['base_asset']}
          />
          {renderInputValidationError('quantity')}
        </div>
        <div className={classes.root}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Slider
                className={classes.slider}
                defaultValue={0}
                step={1}
                marks={marks}
                min={0}
                max={100}
                onChange={handleQPSliderChange}
                value={values.quantityPercentage}
              />
            </Grid>
            <Grid item>
              <InlineInput
                className={classes.input}
                value={values.quantityPercentage}
                margin="dense"
                name="quantityPercentage"
                onChange={handleQPInputChange}
                postLabel={'%'}
                type="text"
              />
            </Grid>
          </Grid>
          {renderInputValidationError('total')}
        </div>

        <Button
          disabled={errors.total || values.profit === 0 || values.profit === ''}
          variant="buy"
          type="submit"
        >
          Add Target {(state?.targets?.length || 0) + 1}
        </Button>
      </form>
    </div>
  )
}

export default ExitTarget
