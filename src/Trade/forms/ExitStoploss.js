import React, { useState, useEffect, useContext } from 'react'
import { InlineInput, Button, TabNavigator, Typography } from '../../components'
import { TradeContext } from '../context/SimpleTradeContext'
import roundNumbers from '../../helpers/roundNumbers'
import { useSymbolContext } from '../context/SymbolContext'
import validate from '../../components/Validation/Validation'
import Slider from 'rc-slider'
import Grid from '@material-ui/core/Grid'
import 'rc-slider/assets/index.css'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  root: {
    width: 330,
  },
  slider: {
    width: 200,
    vertiicalAlign: 'middle',
  },
  input: {
    width: 42,
  },
})

const ExitStoploss = () => {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolBalance,
  } = useSymbolContext()
  const balance = selectedSymbolBalance
  const { state, addStoploss } = useContext(TradeContext)
  const { entry } = state
  const [triggerPrice, setTriggerPrice] = useState(entry.price)
  const [price, setPrice] = useState('')
  const [profit, setProfit] = useState('')
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

  const handleInputChange = (value) => {
    value = 0 - value
    setProfit(value === '' ? '' : Number(value))
    priceAndProfitSync('profit', value)
  }

  const handleBlur = (evt) => {
    if (quantityPercentage < 0) {
      setProfit(0)
      priceAndProfitSync('profit', 0)
    } else if (quantityPercentage > 100) {
      setProfit(100)
      priceAndProfitSync('profit', 100)
    }
  }

  const handleQPSliderChange = (newValue) => {
    setQuantityPercentage(newValue)
    priceAndProfitSync('quantityPercentage', newValue)
  }

  const handleQPInputChange = (value) => {
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

    if (name === 'triggerPrice') {
      setTriggerPrice(value)
      priceAndProfitSync('triggerPrice', value)
    }

    if (name === 'price') {
      setPrice(value)
      priceAndProfitSync('price', value)
      setTotal(value * quantity)
    }

    if (name === 'quantity') {
      setQuantity(value)
      priceAndProfitSync('quantity', value)
      setTotal(value * price) // setting total value for ExitStopLoss
    }
  }

  useEffect(
    () => {
      setValidationFields((validationFields) => ({
        ...validationFields,
        price,
        quantity,
        total,
        balance: balance,
        minNotional: selectedSymbolDetail.minNotional,
        type: 'stoploss',
      }))

      if (triggerPrice && price && quantity) {
        setIsValid(true)
      } else {
        setIsValid(false)
      }
    },
    [
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
    switch (inputChanged) {
      case 'triggerPrice':
        return true

      case 'price':
        const diff = entry.price - value
        const percentage = roundNumbers((diff / entry.price) * 100, 2)
        setProfit(-percentage)
        return true

      case 'profit':
        // check if negative
        const newPrice = entry.price * (-value / 100)
        setPrice(entry.price - newPrice)
        return false

      case 'quantity':
        if (value <= entry.quantity) {
          setQuantityPercentage(roundNumbers((value / entry.quantity) * 100, 4))
        }
        return false

      case 'quantityPercentage':
        const theQuantity = (entry.quantity * value) / 100
        setQuantity(roundNumbers(theQuantity, 6))
        return false

      default: {
        console.error('WARNING')
      }
    }
  }

  return (
    <TabNavigator labelArray={['Stop-limit', 'Stop-market']} index={0}>
      <section style={{ marginTop: '2rem' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()

            setErrors(validate(validationFields))

            const canAfford = total <= balance

            if (canAfford) {
              setIsValid(true)
            }

            if (Object.keys(errors).length === 0 && isValid) {
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
          <InlineInput
            label="Trigger price"
            type="number"
            placeholder="Trigger price"
            value={triggerPrice}
            name="triggerPrice"
            /*             onChange={(value) => {
              setTriggerPrice(value)
              priceAndProfitSync('triggerPrice', value)
            }} */
            onChange={handleChange}
            onBlur={handleBlur}
            postLabel={selectedSymbolDetail['quote_asset']}
          />

          <InlineInput
            label="Price"
            type="number"
            placeholder="price"
            name="price"
            /*             onChange={(value) => {
              setPrice(value)
              priceAndProfitSync('price', value)
            }} */
            onChange={handleChange}
            onBlur={handleBlur}
            value={price}
            postLabel={selectedSymbolDetail['quote_asset']}
          />

          <div className={classes.root}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Typography>Profit</Typography>
              </Grid>
              <Grid item xs className={classes.slider}>
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
              </Grid>
              <Grid item>
                <InlineInput
                  className={classes.input}
                  value={profit}
                  margin="dense"
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  postLabel={'%'}
                />
              </Grid>
            </Grid>
          </div>

          <InlineInput
            label="Amount"
            type="number"
            name="quantity"
            /*             onChange={(value) => {
              setQuantity(value)
              priceAndProfitSync('quantity', value)
            }} */
            onChange={handleChange}
            value={quantity}
            postLabel={isLoading ? '' : selectedSymbolDetail['base_asset']}
          />

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
            type="submit"
            disabled={isValid ? null : 'disabled'}
            variant="sell"
          >
            Add Stop-loss
          </Button>
        </form>
      </section>
      <div style={{ marginTop: '2rem' }}>
        <Typography as="h3">Not available yet</Typography>
      </div>
    </TabNavigator>
  )
}

export default ExitStoploss
