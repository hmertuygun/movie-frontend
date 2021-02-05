import React, { useState, useContext } from 'react'
import { InlineInput, Button, Typography } from '../../components'
import { TradeContext } from '../context/SimpleTradeContext'
import roundNumbers from '../../helpers/roundNumbers'
import { useSymbolContext } from '../context/SymbolContext'
import Slider from 'rc-slider'
import Grid from '@material-ui/core/Grid'
import 'rc-slider/assets/index.css'
import { makeStyles } from '@material-ui/core/styles'
import {
  addPrecisionToNumber,
  removeTrailingZeroFromInput,
} from '../../helpers/precisionRound'
import * as yup from 'yup'

import styles from './ExitForm.module.css'

const useStyles = makeStyles({
  root: {
    width: 255,
    marginBottom: '1rem',
  },
  slider: {
    width: 170,
    marginLeft: '5px',
    vertiicalAlign: 'middle',
  },
  input: {
    width: 35,
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

  const { state, addStoploss } = useContext(TradeContext)
  const { entry } = state

  const pricePrecision = selectedSymbolDetail['tickSize']
  const quantityPrecision = selectedSymbolDetail['lotSize']

  const minPrice = Number(selectedSymbolDetail.minPrice)
  const minQty = Number(selectedSymbolDetail.minQty)

  const entryPrice =
    entry.type === 'market' ? selectedSymbolLastPrice : entry.price

  const [values, setValues] = useState({
    triggerPrice: addPrecisionToNumber(entryPrice, pricePrecision),
    price: '',
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
      price: '',
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
      quantityPercentage: parseInt(value, 10),
    }))
    priceAndProfitSync('quantityPercentage', parseInt(value, 10))
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

    if (name === 'price') {
      setValues((values) => ({
        ...values,
        price: value,
        total: Number(value) * Number(values.quantity),
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
    let usePrice =
      entry.type === 'market' ? selectedSymbolLastPrice : entry.price

    switch (inputName) {
      case 'triggerPrice':
        return true

      case 'price':
        const diff = usePrice - inputValue
        const percentage = roundNumbers((diff / usePrice) * 100, 2)
        setValues((values) => ({
          ...values,
          profit: 0 - percentage,
        }))
        return true

      case 'profit':
        const newPrice = usePrice * (-inputValue / 100)

        setValues((values) => ({
          ...values,
          price: addPrecisionToNumber(usePrice - newPrice, pricePrecision),
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
        price: values.price,
        triggerPrice: values.triggerPrice,
        profit: values.profit,
        quantity: values.quantity,
        quantityPercentage: values.quantityPercentage,
        symbol: selectedSymbolDetail['symbolpair'],
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
        <div className={styles['Input']}>
          <InlineInput
            label="Price"
            type="number"
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
          <Grid container spacing={0} alignItems="center">
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
  )
}

export default ExitStoplossStopLimit
