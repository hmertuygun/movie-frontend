import React, { useState, useContext } from 'react'
import * as yup from 'yup'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import Slider from 'rc-slider'
import { InlineInput, Button, Typography } from '../../components'
import { TradeContext } from '../context/SimpleTradeContext'

import roundNumbers from '../../helpers/roundNumbers'
import { useSymbolContext } from '../context/SymbolContext'
import styles from './ExitForm.module.css'
import {
  addPrecisionToNumber,
  removeTrailingZeroFromInput,
} from '../../helpers/precisionRound'

import 'rc-slider/assets/index.css'

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
  triggerPrice: '',
  quantity: '',
}

const ExitStoplossStopMarket = () => {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolLastPrice,
  } = useSymbolContext()

  const { state, addStoploss } = useContext(TradeContext)
  const { entry } = state

  const pricePrecision = selectedSymbolDetail['tickSize']
  const quantityPrecision = selectedSymbolDetail['lotSize']

  const minQty = Number(selectedSymbolDetail.minQty)

  const entryPrice =
    entry.type === 'market' ? selectedSymbolLastPrice : entry.price

  const [values, setValues] = useState({
    triggerPrice: addPrecisionToNumber(entryPrice, pricePrecision),
    profit: '',
    quantity: '',
    quantityPercentage: '',
    total: '',
  })

  const [errors, setErrors] = useState(errorInitialValues)

  const classes = useStyles()

  const marks = {
    '-100': '',
    '-75': '',
    '-50': '',
    '-25': '',
    0: '',
  }

  // @TODO
  // Move schema to a different folder
  const formSchema = yup.object().shape({
    triggerPrice: yup
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
    newValue = 0 - newValue
    setValues((values) => ({
      ...values,
      profit: newValue,
    }))

    priceAndProfitSync('profit', newValue)

    setErrors((errors) => ({
      ...errors,
      triggerPrice: '',
    }))
  }

  const handleSliderInputChange = ({ target }) => {
    const value = -Math.abs(removeTrailingZeroFromInput(target.value))
    setValues((values) => ({
      ...values,
      profit: Math.abs(value) > 100 ? -100 : Number(value),
    }))
    priceAndProfitSync(target.name, value)

    setErrors((errors) => ({
      ...errors,
      profit: '',
      triggerPrice: '',
    }))
  }

  const handleBlur = ({ target }, precision) => {
    formSchema.fields[target.name].validate(target.value).catch((error) => {
      setErrors((errors) => ({
        ...errors,
        [target.name]: error.message,
      }))
    })
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
    const value = removeTrailingZeroFromInput(Math.abs(target.value))
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

  const handleQPBlur = ({ target }) => {
    const value = target.value > 100 ? 100 : target.value
    setValues((values) => ({
      ...values,
      quantityPercentage: value,
    }))
    priceAndProfitSync('quantityPercentage', value)
  }

  const handleChange = ({ target }) => {
    const { name, value } = target

    setErrors((errors) => ({
      ...errors,
      [name]: '',
    }))

    if (name === 'triggerPrice') {
      setValues((values) => ({
        ...values,
        triggerPrice: value,
      }))
      priceAndProfitSync(name, value)
    }

    if (name === 'quantity') {
      setValues((values) => ({
        ...values,
        quantity: value,
        total: Number(value) * Number(values.price),
      }))

      priceAndProfitSync(name, value)
    }
  }

  const priceAndProfitSync = (inputName, inputValue) => {
    switch (inputName) {
      case 'triggerPrice':
        const diff = entryPrice - inputValue
        const percentage = roundNumbers((diff / entryPrice) * 100, 2)
        setValues((values) => ({
          ...values,
          profit: -percentage,
        }))
        return true

      case 'profit':
        const newPrice = entryPrice * (-inputValue / 100)

        setValues((values) => ({
          ...values,
          triggerPrice: addPrecisionToNumber(
            entryPrice - newPrice,
            pricePrecision
          ),
        }))

        return false

      case 'quantity':
        setValues((values) => ({
          ...values,
          quantityPercentage: roundNumbers(
            (inputValue / entry.quantity) * 100,
            2
          ),
        }))
        return false

      case 'quantityPercentage':
        const theQuantity = (entry.quantity * inputValue) / 100

        setValues((values) => ({
          ...values,
          quantity: addPrecisionToNumber(theQuantity, quantityPrecision),
        }))

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
      addStoploss({
        triggerPrice: values.triggerPrice,
        profit: values.profit,
        quantity: values.quantity,
        quantityPercentage: values.quantityPercentage,
        symbol: selectedSymbolDetail['symbolpair'],
      })
      console.log(values)
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
      <section style={{ marginTop: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div className={styles['Input']}>
            <InlineInput
              label="Trigger price"
              type="number"
              placeholder="Trigger price"
              value={values.triggerPrice}
              name="triggerPrice"
              onChange={handleChange}
              onBlur={(e) => handleBlur(e, pricePrecision)}
              postLabel={selectedSymbolDetail['quote_asset']}
            />

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
                  marks={marks}
                  min={0}
                  max={100}
                  onChange={handleSliderChange}
                  value={0 - values.profit}
                />
              </div>
              <div className={styles['SliderInput']}>
                <InlineInput
                  className={classes.input}
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
              label="Amount"
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
                  onChange={handleQPInputChange}
                  onBlur={handleQPBlur}
                  postLabel={'%'}
                />
              </Grid>
            </Grid>
          </div>

          <Button
            type="submit"
            disabled={state?.stoploss?.length || !values.quantity}
            variant="sell"
          >
            Add Stop-loss
          </Button>
        </form>
      </section>
    </div>
  )
}

export default ExitStoplossStopMarket
