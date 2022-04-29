import React, { useState, useContext, useEffect } from 'react'
import * as yup from 'yup'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import Slider from 'rc-slider'
import { InlineInput, Button, Typography } from 'components'
import { TradeContext } from 'contexts/SimpleTradeContext'

import { useSymbolContext } from 'contexts/SymbolContext'
import styles from '../ExitStoplossStopLimit/ExitForm.module.css'

import {
  addPrecisionToNumber,
  removeTrailingZeroFromInput,
  getMaxInputLength,
  getInputLength,
  convertCommaNumberToDot,
  detectEntryPrice,
  allowOnlyNumberDecimalAndComma,
} from 'utils/tradeForm'

import scientificToDecimal from 'utils/toDecimal'

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
  triggerPrice: '',
  quantity: '',
  total: '',
}

const ExitStoplossStopMarket = () => {
  const { isLoading, selectedSymbolDetail, selectedSymbolLastPrice } =
    useSymbolContext()

  const { state, addStoplossMarket } = useContext(TradeContext)
  const { entry } = state

  const tickSize = selectedSymbolDetail && selectedSymbolDetail['tickSize']
  const pricePrecision = tickSize > 8 ? '' : tickSize
  const symbolPair = selectedSymbolDetail && selectedSymbolDetail['symbolpair']
  const quoteAssetPrecision =
    selectedSymbolDetail && selectedSymbolDetail['quote_asset_precision']
  const totalPrecision = symbolPair === 'ETHUSDT' ? 7 : quoteAssetPrecision
  const quantityPrecision =
    selectedSymbolDetail && selectedSymbolDetail['lotSize']
  const profitPercentagePrecision = 2
  const amountPercentagePrecision = 1

  const minPrice = selectedSymbolDetail && Number(selectedSymbolDetail.minPrice)
  const minQty = selectedSymbolDetail && Number(selectedSymbolDetail.minQty)
  const minNotional =
    selectedSymbolDetail && Number(selectedSymbolDetail.minNotional)

  const entryPrice = detectEntryPrice(entry, selectedSymbolLastPrice)

  const [values, setValues] = useState({
    triggerPrice: addPrecisionToNumber(entryPrice, pricePrecision),
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

  useEffect(() => {
    setValues({
      triggerPrice: addPrecisionToNumber(entryPrice, pricePrecision),
      profit: '',
      quantity: '',
      quantityPercentage: '',
      total: '',
      price_trigger: { value: 'p', label: 'Last' },
    })
  }, [selectedSymbolDetail])

  // @TODO
  // Move schema to a different folder
  const formSchema = yup.object().shape({
    triggerPrice: minPrice
      ? yup
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
          )
          .test(
            'Trigger price',
            `Trigger price has to be lower than current market price`,
            (value) => value < selectedSymbolLastPrice
          )
      : yup
          .number()
          .required('Trigger price is required')
          .typeError('Trigger price is required')
          .test(
            'Trigger price',
            `Trigger price has to be lower than Entry price: ${addPrecisionToNumber(
              entryPrice,
              pricePrecision
            )}`,
            (value) => value < entryPrice
          )
          .test(
            'Trigger price',
            `Trigger price has to be lower than current market price`,
            (value) => value < selectedSymbolLastPrice
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
      profit: Number.isNaN(validatedValue) ? '' : validatedValue,
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
        total: Number(value) * Number(values.triggerPrice),
      }))

      priceAndProfitSync(name, value)
    }

    validateInput(target)
  }

  const priceAndProfitSync = (inputName, inputValue) => {
    switch (inputName) {
      case 'triggerPrice': {
        const diff = entryPrice - inputValue
        const percentage = (diff / entryPrice) * 100
        const profitPercentage = percentage > 99 ? 99 : percentage.toFixed(2)
        setValues((values) => ({
          ...values,
          profit: -profitPercentage,
        }))
        return true
      }

      case 'profit':
        const newPrice = scientificToDecimal(entryPrice * (-inputValue / 100))

        const derivedtiggerPrice = addPrecisionToNumber(
          scientificToDecimal(entryPrice - newPrice),
          pricePrecision
        )

        setValues((values) => ({
          ...values,
          triggerPrice: derivedtiggerPrice,
          total: derivedtiggerPrice * Number(values.quantity),
        }))

        validateInput({
          name: 'triggerPrice',
          value: derivedtiggerPrice,
        })

        if (values.triggerPrice && values.quantity) {
          validateInput({
            name: 'total',
            value: derivedtiggerPrice * Number(values.quantity),
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
          total: derivedQuantity * Number(values.triggerPrice),
        }))

        validateInput({
          name: 'quantity',
          value: derivedQuantity,
        })

        if (values.triggerPrice && values.quantity) {
          validateInput({
            name: 'total',
            value: derivedQuantity * Number(values.triggerPrice),
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
      addStoplossMarket({
        triggerPrice: convertCommaNumberToDot(values.triggerPrice),
        profit: convertCommaNumberToDot(values.profit),
        quantity: convertCommaNumberToDot(values.quantity),
        quantityPercentage: convertCommaNumberToDot(values.quantityPercentage),
        symbol: selectedSymbolDetail && selectedSymbolDetail['symbolpair'],
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
    <div style={{ marginTop: '2rem' }}>
      <div style={{ marginTop: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div className={styles['Input']}>
            <div className={styles['InputDropdownContainer']}>
              <InlineInput
                label="Trigger Price"
                type="text"
                placeholder=""
                value={values.triggerPrice}
                name="triggerPrice"
                onChange={handleChange}
                onBlur={(e) => handleBlur(e, pricePrecision)}
                postLabel={
                  selectedSymbolDetail && selectedSymbolDetail['quote_asset']
                }
              />
            </div>
            {renderInputValidationError('triggerPrice')}
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
                  onChange={handleQPInputChange}
                  name="quantityPercentage"
                  postLabel={'%'}
                  type="text"
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
      </div>
    </div>
  )
}

export default ExitStoplossStopMarket
