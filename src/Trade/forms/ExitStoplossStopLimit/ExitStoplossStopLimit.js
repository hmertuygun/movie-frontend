import React, { useState, useContext } from 'react'
import { InlineInput, Button, Typography } from '../../../components'
import PriceTriggerDropdown from '../../components/PriceTriggerDropdown/PriceTriggerDropdown'
import { TradeContext } from '../../context/SimpleTradeContext'
import roundNumbers from '../../../helpers/roundNumbers'
import { useSymbolContext } from '../../context/SymbolContext'
import Slider from 'rc-slider'
import Grid from '@material-ui/core/Grid'
import 'rc-slider/assets/index.css'
import { makeStyles } from '@material-ui/core/styles'

import {
  addPrecisionToNumber,
  removeTrailingZeroFromInput,
  getMaxInputLength,
  getInputLength,
  convertCommaNumberToDot,
  detectEntryPrice,
  allowOnlyNumberDecimalAndComma,
} from '../../../helpers/tradeForm'

import scientificToDecimal from '../../../helpers/toDecimal'

import * as yup from 'yup'

import styles from './ExitForm.module.css'

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
  },
})

const errorInitialValues = {
  triggerPrice: '',
  price: '',
  profit: '',
  quantity: '',
  quantityPercentage: '',
  total: '',
}

const ExitStoplossStopLimit = () => {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolLastPrice,
  } = useSymbolContext()

  const { state, addStoplossLimit } = useContext(TradeContext)
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

  const minPrice = Number(selectedSymbolDetail.minPrice)
  const minQty = Number(selectedSymbolDetail.minQty)
  const minNotional = Number(selectedSymbolDetail.minNotional)

  const entryPrice = detectEntryPrice(entry, selectedSymbolLastPrice)

  const [values, setValues] = useState({
    triggerPrice: addPrecisionToNumber(entryPrice, pricePrecision),
    price: '',
    profit: '',
    quantity: '',
    quantityPercentage: '',
    total: '',
    price_trigger: { value: 'p', label: 'Last' },
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
  const marks2 = {
    0: '',
    25: '',
    50: '',
    75: '',
    99: '',
  }

  // @TODO
  // Move schema to a different folder
  const formSchema = yup.object().shape({
    triggerPrice: yup
      .number()
      .required('Trigger price is required')
      .typeError('Trigger price is required')
      .min(
        minPrice,
        `Trigger price needs to meet min-price: ${addPrecisionToNumber(
          minPrice,
          pricePrecision
        )}`
      )
      .test(
        'Trigger price',
        `Trigger price has to be lower than Entry price: ${addPrecisionToNumber(
          entryPrice,
          pricePrecision
        )}`,
        (value) => value < entryPrice
      ),
    price: yup
      .number()
      .required('Price is required')
      .typeError('Price is required')
      .min(
        minPrice,
        `Price needs to meet min-price: ${addPrecisionToNumber(
          minPrice,
          pricePrecision
        )}`
      )
      .max(values.triggerPrice, 'Price cannot be higher than Trigger Price'),
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
    newValue = 0 - newValue
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

    const value = !target.value
      ? ''
      : -Math.abs(removeTrailingZeroFromInput(target.value))

    const validatedValue = Math.abs(value) > 99 ? -99 : value

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

    if (name === 'triggerPrice') {
      const maxLength = getMaxInputLength(target.value, pricePrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return

      setValues((values) => ({
        ...values,
        triggerPrice: value,
      }))
      priceAndProfitSync(name, value)
    }

    if (name === 'price') {
      const maxLength = getMaxInputLength(target.value, pricePrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return
      setValues((values) => ({
        ...values,
        price: value,
        total: Number(value) * Number(values.quantity),
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

  const detectUsePrice = (entry) => {
    switch (entry.type) {
      case 'market':
        return selectedSymbolLastPrice
      case 'stop-market':
        return entry.trigger
      default:
        return entry.price
    }
  }

  const priceAndProfitSync = (inputName, inputValue) => {
    const usePrice = detectUsePrice(entry)

    switch (inputName) {
      case 'price': {
        const diff = usePrice - inputValue
        const percentage = (diff / usePrice) * 100
        const profitPercentage = percentage > 99 ? 99 : percentage.toFixed(2)
        setValues((values) => ({
          ...values,
          profit: 0 - profitPercentage,
        }))
        return true
      }

      case 'profit':
        const newPrice = scientificToDecimal(usePrice * (-inputValue / 100))
        const derivedPrice = addPrecisionToNumber(
          scientificToDecimal(usePrice - newPrice),
          pricePrecision
        )
        setValues((values) => ({
          ...values,
          price: derivedPrice,
          total: derivedPrice * Number(values.quantity),
        }))

        validateInput({
          name: 'price',
          value: derivedPrice,
        })

        if (values.price && values.quantity) {
          validateInput({
            name: 'total',
            value: derivedPrice * Number(values.quantity),
          })
        }

        return false

      case 'quantity': {
        const percentage = (inputValue / entry.quantity) * 100
        const quantityPercentage =
          percentage > 100 ? 100 : percentage.toFixed(0)
        setValues((values) => ({
          ...values,
          quantityPercentage,
        }))
        return false
      }

      case 'quantityPercentage':
        const theQuantity = (entry.quantity * inputValue) / 100

        const derivedQuantity = addPrecisionToNumber(
          theQuantity,
          quantityPrecision
        )

        setValues((values) => ({
          ...values,
          quantity: derivedQuantity,
          total: derivedQuantity * Number(values.price),
        }))

        validateInput({
          name: 'quantity',
          value: derivedQuantity,
        })

        if (values.price && values.quantity) {
          validateInput({
            name: 'total',
            value: derivedQuantity * Number(values.price),
          })
        }

        return false

      default: {
        console.error('WARNING')
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isFormValid = await validateForm()

    if (isFormValid) {
      addStoplossLimit({
        price: convertCommaNumberToDot(values.price),
        triggerPrice: convertCommaNumberToDot(values.triggerPrice),
        profit: convertCommaNumberToDot(values.profit),
        quantity: convertCommaNumberToDot(values.quantity),
        quantityPercentage: convertCommaNumberToDot(values.quantityPercentage),
        symbol: selectedSymbolDetail['symbolpair'],
        price_trigger: values.price_trigger.value,
      })
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
          <div className={styles['InputDropdownContainer']}>
            <PriceTriggerDropdown
              options={[
                { value: 'b', label: 'Bid' },
                { value: 'a', label: 'Ask' },
                { value: 'p', label: 'Last' },
              ]}
              value={values.price_trigger}
              onSelect={(selected) =>
                setValues({ ...values, price_trigger: selected })
              }
            />
            <InlineInput
              label="Trigger Price"
              type="text"
              placeholder=""
              value={values.triggerPrice}
              name="triggerPrice"
              onChange={handleChange}
              onBlur={(e) => handleBlur(e, pricePrecision)}
              postLabel={selectedSymbolDetail['quote_asset']}
            />
          </div>
          {renderInputValidationError('triggerPrice')}
        </div>
        <div className={styles['Input']}>
          <InlineInput
            label="Price"
            type="text"
            placeholder="price"
            name="price"
            onChange={handleChange}
            onBlur={(e) => handleBlur(e, pricePrecision)}
            value={values.price}
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
                reverse
                defaultValue={0}
                step={1}
                marks={marks2}
                min={0}
                max={99}
                onChange={handleSliderChange}
                value={0 - values.profit}
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
            label="Amount"
            type="text"
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
                defaultValue={1}
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
                onChange={handleQPInputChange}
                name="quantityPercentage"
                postLabel={'%'}
              />
            </Grid>
          </Grid>
          {renderInputValidationError('total')}
        </div>

        <Button
          type="submit"
          disabled={
            state?.stoploss?.length || !values.quantity || values.profit === 0
          }
          variant="sell"
        >
          Add Stop-loss
        </Button>
      </form>
    </section>
  )
}

export default ExitStoplossStopLimit
