import React, { useState, useContext, useEffect } from 'react'
import { InlineInput, Button, Typography } from '../../components'
import { TradeContext } from '../context/SimpleTradeContext'
import roundNumbers from '../../helpers/roundNumbers'
import { useSymbolContext } from '../context/SymbolContext'
import Slider from 'rc-slider'
import Grid from '@material-ui/core/Grid'

import * as yup from 'yup'

import {
  addPrecisionToNumber,
  removeTrailingZeroFromInput,
  getMaxInputLength,
  getInputLength,
} from '../../helpers/tradeForm'

import 'rc-slider/assets/index.css'
import { makeStyles } from '@material-ui/core/styles'

import styles from './ExitTargetForm.module.css'

const useStyles = makeStyles({
  root: {
    width: 255,
    marginBottom: '1rem',
  },
  slider: {
    width: 160,
    vertiicalAlign: 'middle',
    marginLeft: '8px',
  },
  input: {
    width: 35,
  },
})

const errorInitialValues = {
  price: '',
  quantity: '',
  total: '',
}

const ExitTargetStopMarket = () => {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolLastPrice,
  } = useSymbolContext()

  const { addStopMarketTarget, state } = useContext(TradeContext)
  const { entry } = state

  const pricePrecision = selectedSymbolDetail['tickSize']
  const quantityPrecision = selectedSymbolDetail['lotSize']
  const profitPercentagePrecision = 2
  const amountPercentagePrecision = 1

  const maxPrice = Number(selectedSymbolDetail.maxPrice)
  const minQty = Number(selectedSymbolDetail.minQty)

  const sumQuantity = state.targets?.map((item) => item.quantity)
  const totalQuantity = sumQuantity?.reduce(
    (total, value) => parseFloat(total) + parseFloat(value),
    0
  )

  const entryPrice =
    entry.type === 'market' ? selectedSymbolLastPrice : entry.price

  const [values, setValues] = useState({
    price: addPrecisionToNumber(entryPrice, pricePrecision),
    profit: '',
    quantity: '',
    quantityPercentage: '',
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
      .positive()
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
        `Stop loss amount cannot be higher than entry amount: ${entry.quantity}`
      ),
  })

  const handleSliderChange = (newValue) => {
    setValues((values) => ({
      ...values,
      profit: newValue,
    }))

    priceAndProfitSync('profit', newValue)

    setErrors((errors) => ({
      ...errors,
      price: '',
    }))
  }

  const handleSliderInputChange = ({ target }) => {
    const maxLength = getMaxInputLength(target.value, profitPercentagePrecision)
    const inputLength = getInputLength(target.value)
    if (inputLength > maxLength) return

    const value = !target.value ? '' : Math.abs(target.value)

    setValues((values) => ({
      ...values,
      profit: value > 100 ? 100 : value,
    }))

    priceAndProfitSync(target.name, value)

    setErrors((errors) => ({
      ...errors,
      profit: '',
    }))
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

    setErrors((errors) => ({
      ...errors,
      quantity: '',
    }))
  }

  const handleQPInputChange = ({ target }) => {
    const maxLength = getMaxInputLength(target.value, amountPercentagePrecision)
    const inputLength = getInputLength(target.value)
    if (inputLength > maxLength) return

    const value = !target.value
      ? ''
      : removeTrailingZeroFromInput(Math.abs(target.value))

    setValues((values) => ({
      ...values,
      quantityPercentage: value > 100 ? 100 : value,
    }))
    priceAndProfitSync(target.name, value)

    setErrors((errors) => ({
      ...errors,
      quantity: '',
    }))
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
    const { name, value } = target

    if (name === 'price') {
      const maxLength = getMaxInputLength(target.value, pricePrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return

      setValues((values) => ({
        ...values,
        [name]: value,
      }))

      priceAndProfitSync(name, value)
    }

    if (name === 'quantity') {
      const maxLength = getMaxInputLength(target.value, quantityPrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return

      setValues((values) => ({
        ...values,
        quantity: value,
        total: Number(value) * Number(values.price),
      }))

      priceAndProfitSync(name, value)
    }

    validateInput(target)
  }

  const priceAndProfitSync = (inputName, inputValue) => {
    if (inputName === 'price' && inputValue > entryPrice) {
      const diff = inputValue - entryPrice
      const percentage = roundNumbers((diff / entryPrice) * 100, 2)
      setValues((values) => ({
        ...values,
        profit: percentage,
      }))
    }

    if (inputName === 'profit') {
      setValues((values) => ({
        ...values,
        price: roundNumbers(
          entryPrice * (1 + inputValue / 100),
          pricePrecision
        ),
      }))
    }

    if (inputName === 'quantity' && inputValue <= entry.quantity) {
      setValues((values) => ({
        ...values,
        quantityPercentage: roundNumbers(
          (inputValue / entry.quantity) * 100,
          quantityPrecision
        ),
      }))
    }

    if (inputName === 'quantityPercentage') {
      const theQuantity = (entry.quantity * inputValue) / 100
      setValues((values) => ({
        ...values,
        quantity: roundNumbers(
          theQuantity,
          selectedSymbolDetail['base_asset_precision']
        ),
      }))
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
    if (Number(values.quantity) + totalQuantity >= entry.quantity) {
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
  }, [totalQuantity, values.quantity, values.quantityPercentage])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isFormValid = await validateForm()

    const isLimit = Number(values.quantity) + totalQuantity >= entry.quantity

    if (isFormValid && !isLimit) {
      addStopMarketTarget({
        price: values.price,
        quantity: values.quantity,
        profit: values.profit,
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
    <section style={{ marginTop: '2rem' }}>
      <form onSubmit={handleSubmit}>
        <div className={styles['Input']}>
          <InlineInput
            label="Trigger Price"
            type="number"
            placeholder="Trigger price"
            value={values.price}
            name="price"
            onChange={handleChange}
            onBlur={(e) => handleBlur(e, pricePrecision)}
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
              />
            </div>
          </div>
        </div>
        <div className={styles['Input']}>
          <InlineInput
            label="Quantity"
            type="number"
            name="quantity"
            onChange={handleChange}
            onBlur={(e) => handleBlur(e, quantityPrecision)}
            value={values.quantity}
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
          Add Target
        </Button>
      </form>
    </section>
  )
}

export default ExitTargetStopMarket
