import React, { useState, useEffect, useContext } from 'react'
import { InlineInput, Button, Typography } from '../../components'
import { TradeContext } from '../context/SimpleTradeContext'
import roundNumbers from '../../helpers/roundNumbers'
import { useSymbolContext } from '../context/SymbolContext'
import validate from '../../components/Validation/MarketValidationTarget'
import Slider from 'rc-slider'
import Grid from '@material-ui/core/Grid'
import 'rc-slider/assets/index.css'
import { makeStyles } from '@material-ui/core/styles'
import styles from './ExitTargetForm.module.css'

const useStyles = makeStyles({
  root: {
    width: 255,
  },
  slider: {
    width: 120,
    vertiicalAlign: 'middle',
  },
  input: {
    width: 30,
  },
})

const ExitTargetStopMarket = () => {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolBalance,
    selectedSymbolLastPrice,
  } = useSymbolContext()
  const balance = selectedSymbolBalance

  const [profit, setProfit] = useState(0)
  const [quantity, setQuantity] = useState('')
  const [quantityPercentage, setQuantityPercentage] = useState('')
  const [total, setTotal] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [errors, setErrors] = useState({})
  const [validationFields, setValidationFields] = useState({})

  const { addStopMarketTarget, state } = useContext(TradeContext) // addTarget
  // ingoing value
  const { entry } = state
  const [price, setPrice] = useState(
    roundNumbers(
      entry.type === 'market' ? selectedSymbolLastPrice : entry.price,
      selectedSymbolDetail['tickSize']
    )
  )

  const classes = useStyles()
  const marks = {
    0: '',
    25: '',
    50: '',
    75: '',
    100: '',
  }

  const handleSliderChange = (newValue) => {
    setProfit(newValue)
    priceAndProfitSync('profit', newValue)
  }

  const handleInputChange = (evt) => {
    let { value } = evt.target

    value = Math.abs(value)

    setProfit(value === '' ? '' : Number(value))
    priceAndProfitSync('profit', value)
  }

  const handleBlur = (evt) => {
    let { name } = evt.target

    if (name === 'profit') {
      if (profit < 0) {
        setProfit(0)
        priceAndProfitSync('profit', 0)
      } else if (profit > 100) {
        setProfit(100)
        priceAndProfitSync('profit', 100)
      }
    }
  }

  const handleQPSliderChange = (newValue) => {
    setQuantityPercentage(newValue)
    priceAndProfitSync('quantityPercentage', newValue)
  }

  const handleQPInputChange = (evt) => {
    let { value } = evt.target
    setQuantityPercentage(value === '' ? '' : Number(value))
    priceAndProfitSync('quantityPercentage', value)
  }

  const handleQPBlur = () => {
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

    if (name === 'price') {
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
      //setPrice(value)
      priceAndProfitSync('price', valueFormatedPrice)
      //priceAndProfitSync('price', value)
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
    setPrice(entry.price)
  }, [entry])

  // VALIDATE FORM
  useEffect(() => {
    setValidationFields((validationFields) => ({
      ...validationFields,
      price: entry.price,
      quantity,
      total,
      balance: balance,
      minNotional: selectedSymbolDetail.minNotional,
      entryQuantity: entry.quantity,
    }))

    if (price !== entry.price && price && quantity <= entry.quantity) {
      setIsValid(true)
    } else {
      setIsValid(false)
    }
  }, [
    price,
    quantity,
    balance,
    total,
    entry.quantity,
    entry.price,
    selectedSymbolDetail.minNotional,
  ])

  // PRICE and PROFIT Sync
  const priceAndProfitSync = (inputChanged, value) => {
    let usePrice =
      entry.type === 'market' ? selectedSymbolLastPrice : entry.price

    if (inputChanged === 'price' && value > usePrice) {
      // set profit %
      const diff = value - entry.price
      setProfit(roundNumbers((diff / usePrice) * 100, 2))
    }

    if (inputChanged === 'profit') {
      setPrice(
        roundNumbers(
          usePrice * (1 + value / 100),
          selectedSymbolDetail['tickSize']
        )
      )
    }

    if (inputChanged === 'quantity' && value <= entry.quantity) {
      setQuantityPercentage(
        roundNumbers(
          (value / entry.quantity) * 100,
          selectedSymbolDetail['lotSize']
        )
      )
    }

    if (
      (inputChanged === 'quantityPercentage' && value < 101) ||
      (inputChanged === 'quantityPercentage' && value > 0)
    ) {
      const theQuantity = (entry.quantity * value) / 100
      setQuantity(roundNumbers(theQuantity, selectedSymbolDetail['lotSize']))
    }

    return false
  }

  return (
    <section style={{ marginTop: '2rem' }}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setErrors(validate(validationFields))
          const symbol = selectedSymbolDetail['symbolpair']
          addStopMarketTarget({
            price,
            quantity,
            profit,
            symbol,
          })

          setProfit(0)
          setQuantity('')
          setQuantityPercentage('')
        }}
      >
        <InlineInput
          label="Trigger Price"
          type="number"
          name="price"
          onChange={handleChange}
          onBlur={handleBlur}
          value={price}
          placeholder="Target price"
          postLabel={selectedSymbolDetail['quote_asset']}
        />

        <div className={classes.root}>
          <div className={styles['SliderRow']}>
            <div className={styles['SliderText']}>
              <Typography>Profit</Typography>
            </div>
            <div className={styles['SliderSlider']}>
              <Slider
                defaultValue={0}
                step={1}
                marks={marks}
                min={0}
                max={100}
                onChange={handleSliderChange}
                value={profit}
              />
            </div>
            <div className={styles['SliderInput']}>
              <InlineInput
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

        <InlineInput
          label="Quantity"
          type="number"
          name="quantity"
          onBlur={handleBlur}
          onChange={handleChange}
          value={quantity}
          postLabel={isLoading ? '' : selectedSymbolDetail['base_asset']}
        />
        {errors.quantity && (
          <div className="error" style={{ color: 'red' }}>
            {errors.quantity}
          </div>
        )}
        <div className={classes.root}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs className={classes.slider}>
              <Slider
                defaultValue={0}
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
            <div className="error" style={{ color: 'red' }}>
              {errors.total}
            </div>
          )}
        </div>

        <Button
          disabled={isValid ? false : 'disabled'}
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
