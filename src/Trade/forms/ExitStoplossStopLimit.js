import React, { useState, useEffect, useContext } from 'react'
import { InlineInput, Button, Typography } from '../../components'
import { TradeContext } from '../context/SimpleTradeContext'
import roundNumbers from '../../helpers/roundNumbers'
import { useSymbolContext } from '../context/SymbolContext'
import validate from '../../components/Validation/LimitValidation'
import Slider from 'rc-slider'
import Grid from '@material-ui/core/Grid'
import 'rc-slider/assets/index.css'
import { makeStyles } from '@material-ui/core/styles'

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

const ExitStoplossStopLimit = () => {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolBalance,
    selectedSymbolLastPrice,
  } = useSymbolContext()
  const balance = selectedSymbolBalance
  const { state, addStoploss } = useContext(TradeContext)
  const { entry } = state
  const [triggerPrice, setTriggerPrice] = useState(
    roundNumbers(
      entry.type === 'market' ? selectedSymbolLastPrice : entry.price,
      selectedSymbolDetail['tickSize']
    )
  )
  //setEntryPrice
  const [entryPrice] = useState(
    roundNumbers(
      entry.type === 'market' ? selectedSymbolLastPrice : entry.price,
      selectedSymbolDetail['tickSize']
    )
  )
  const [price, setPrice] = useState('')
  const [profit, setProfit] = useState(0)
  const [quantity, setQuantity] = useState('')
  const [quantityPercentage, setQuantityPercentage] = useState('')
  const [total, setTotal] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [errors, setErrors] = useState({})
  const [validationFields, setValidationFields] = useState({})

  const classes = useStyles()
  const marks = {
    '-100': '',
    '-75': '',
    '-50': '',
    '-25': '',
    0: '',
  }

  const handleSliderChange = (newValue) => {
    newValue = 0 - newValue
    setProfit(newValue)
    priceAndProfitSync('profit', newValue)
  }

  const handleInputChange = (evt) => {
    let { value } = evt.target
    value = -Math.abs(value)
    setProfit(value === '' ? '' : Number(value))
    priceAndProfitSync('profit', value)
  }

  const handleBlur = (evt) => {
    let { name, value } = evt.target

    if (name === 'profit') {
      if (value < -Math.abs(100)) {
        setProfit(-Math.abs(100))
        priceAndProfitSync('profit', 100)
      } else if (value > 0) {
        setProfit(-Math.abs(100))
        priceAndProfitSync('profit', 100)
      }
    }
  }

  const handleQPSliderChange = (newValue) => {
    setQuantityPercentage(newValue)
    priceAndProfitSync('quantityPercentage', newValue)
  }

  const handleQPInputChange = (evt) => {
    const { value } = evt.target
    setQuantityPercentage(value === '' ? '' : Number(value))
    priceAndProfitSync('quantityPercentage', value)
  }

  const handleQPBlur = (evt) => {
    if (quantityPercentage < 0) {
      setQuantityPercentage(0)
      priceAndProfitSync('quantityPercentage', 0)
    } else if (quantityPercentage > 100) {
      setQuantityPercentage(100)
      priceAndProfitSync('quantityPercentage', 100)
    }
  }

  const handleChange = (evt) => {
    let { name, value } = evt.target

    if (name === 'triggerPrice') {
      const newValueTrgPrice = value
        .toString()
        .split('.')
        .map((el, i) =>
          i
            ? el.split('').slice(0, selectedSymbolDetail['tickSize']).join('')
            : el
        )
        .join('.')

      const valueFormatedTrgPrice = roundNumbers(
        newValueTrgPrice,
        selectedSymbolDetail['tickSize']
      )
      //setTriggerPrice(value)
      setTriggerPrice(valueFormatedTrgPrice)
      //priceAndProfitSync('triggerPrice', value)
      priceAndProfitSync('triggerPrice', valueFormatedTrgPrice)
    }

    if (name === 'price') {
      //setPrice(value)
      const newValuePrice = value
        .toString()
        .split('.')
        .map((el, i) =>
          i
            ? el.split('').slice(0, selectedSymbolDetail['tickSize']).join('')
            : el
        )
        .join('.')

      const valueFormatedPrice = roundNumbers(
        newValuePrice,
        selectedSymbolDetail['tickSize']
      )
      setPrice(valueFormatedPrice)
      priceAndProfitSync('price', valueFormatedPrice)
      //priceAndProfitSync('price', value)
      setTotal(value * quantity)
    }

    if (name === 'quantity') {
      const newValueQtd = value
        .toString()
        .split('.')
        .map((el, i) =>
          i
            ? el.split('').slice(0, selectedSymbolDetail['lotSize']).join('')
            : el
        )
        .join('.')

      const valueFormatedQtd = roundNumbers(
        newValueQtd,
        selectedSymbolDetail['lotSize']
      )

      setQuantity(valueFormatedQtd)
      //setQuantity(value)
      priceAndProfitSync('quantity', valueFormatedQtd)
      //priceAndProfitSync('quantity', value)
      setTotal(value * price)
    }
  }
  useEffect(() => {
    setQuantityPercentage(100)
  }, [])

  useEffect(
    () => {
      setValidationFields((validationFields) => ({
        ...validationFields,
        entryPrice,
        triggerPrice,
        price,
        quantity,
        total,
        balance: balance,
        minNotional: selectedSymbolDetail.minNotional,
        type: 'stoploss',
        entryQuantity: entry.quantity,
      }))

      if (triggerPrice && quantity) {
        if (state.stoploss) {
          if (!state.stoploss.length) {
            setIsValid(true)
          } else if (Object.keys(state.stoploss).length) {
            setIsValid(false)
          }
        } else {
          setIsValid(true)
        }
      }
    },
    [
      state,
      entryPrice,
      triggerPrice,
      price,
      quantity,
      entry.quantity,
      balance,
      total,
      selectedSymbolDetail.minNotional,
    ],
    () => {}
  )

  const priceAndProfitSync = (inputChanged, value) => {
    let usePrice =
      entry.type === 'market' ? selectedSymbolLastPrice : entry.price

    switch (inputChanged) {
      case 'triggerPrice':
        return true

      case 'price':
        const diff = usePrice - value
        const percentage = roundNumbers((diff / usePrice) * 100, 2)
        setProfit(0 - percentage)
        return true

      case 'profit':
        // check if negative
        const newPrice = usePrice * (-value / 100)
        setPrice(
          roundNumbers(usePrice - newPrice, selectedSymbolDetail['tickSize'])
        )
        return false

      case 'quantity':
        setQuantityPercentage(roundNumbers((value / entry.quantity) * 100, 2))
        return false

      case 'quantityPercentage':
        const theQuantity = (entry.quantity * value) / 100
        setQuantity(roundNumbers(theQuantity, selectedSymbolDetail['lotSize']))
        setTotal(quantity * triggerPrice)
        return false

      default: {
        console.error('WARNING')
      }
    }
  }

  return (
    <section style={{ marginTop: '2rem' }}>
      <form
        onSubmit={(e) => {
          e.preventDefault()

          const x = validate(validationFields)
          setErrors(x)
          const canAfford = total <= balance

          if (canAfford) {
            setIsValid(true)
          }
          if (Object.keys(x).length === 0 && isValid) {
            const symbol = selectedSymbolDetail['symbolpair']
            addStoploss({
              price,
              triggerPrice,
              profit,
              quantity,
              quantityPercentage,
              symbol,
            })
          }
        }}
      >
        <div className={styles['Input']}>
          <InlineInput
            label="Trigger price"
            type="number"
            placeholder="Trigger price"
            value={triggerPrice}
            name="triggerPrice"
            onChange={handleChange}
            onBlur={handleBlur}
            postLabel={selectedSymbolDetail['quote_asset']}
          />

          {errors.triggerPrice && (
            <div className={styles['Error']}>{errors.triggerPrice}</div>
          )}
        </div>
        {/* {errors.triggerPrice && (
          <div className="error" style={{ color: 'red' }}>
            {errors.triggerPrice}
          </div>
        )} */}
        <div className={styles['Input']}>
          <InlineInput
            label="Price"
            type="number"
            placeholder="price"
            name="price"
            onChange={handleChange}
            onBlur={handleBlur}
            value={price}
            postLabel={selectedSymbolDetail['quote_asset']}
          />
          {errors.price && (
            <div className={styles['Error']}>{errors.price}</div>
          )}
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
                value={0 - profit}
              />
            </div>
            <div className={styles['SliderInput']}>
              <InlineInput
                className={classes.input}
                value={profit}
                margin="dense"
                onChange={handleInputChange}
                onBlur={handleBlur}
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
            onBlur={handleBlur}
            onChange={handleChange}
            value={quantity}
            postLabel={isLoading ? '' : selectedSymbolDetail['base_asset']}
          />
          {errors.quantity && (
            <div className={styles['Error']}>{errors.quantity}</div>
          )}
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
                value={quantityPercentage}
              />
            </Grid>
            <Grid item>
              <InlineInput
                className={classes.input}
                value={quantityPercentage}
                margin="dense"
                onChange={handleQPInputChange}
                onBlur={handleQPBlur}
                postLabel={'%'}
              />
            </Grid>
          </Grid>
          {errors.total && (
            <div className={styles['Error']}>{errors.total}</div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isValid ? null : 'disabled'}
          variant="sell"
        >
          Add Stop-loss
        </Button>
      </form>
    </section>
  )
}

export default ExitStoplossStopLimit
