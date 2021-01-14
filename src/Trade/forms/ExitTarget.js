import React, { useState, useEffect, useContext } from 'react'
import { InlineInput, Button, TabNavigator, Typography } from '../../components'
import { TradeContext } from '../context/SimpleTradeContext'
import roundNumbers from '../../helpers/roundNumbers'
import { useSymbolContext } from '../context/SymbolContext'
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
    vertiicalAlign: 'middle'
  },
  input: {
    width: 42,
  },
});

const ExitTarget = () => {
  const { isLoading, selectedSymbolDetail } = useSymbolContext()
  const [price, setPrice] = useState('')
  const [profit, setProfit] = useState('')
  const [quantity, setQuantity] = useState('')
  const [quantityPercentage, setQuantityPercentage] = useState('')
  const [isValid, setIsValid] = useState(false)

  const { addTarget, state } = useContext(TradeContext)
  // ingoing value
  const { entry } = state

  const classes = useStyles()
  const marks = {
    0: '',
    25: '',
    50: '',
    75: '',
    100: ''
  }

  const handleSliderChange = (newValue) => {
    setProfit(newValue)
    priceAndProfitSync('profit', newValue)
  }

  const handleInputChange = (value) => {
    setProfit(value === '' ? '' : Number(value));
    priceAndProfitSync('profit', value)
  }

  const handleBlur = () => {
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
    setQuantityPercentage(value === '' ? '' : Number(value));
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

  useEffect(() => {
    setPrice(entry.price)
  }, [entry])

  // VALIDATE FORM
  useEffect(() => {
    if (price !== entry.price && price && quantity <= entry.quantity) {
      setIsValid(true)
    } else {
      setIsValid(false)
    }
  }, [price, quantity, entry.quantity, entry.price])

  // PRICE and PROFIT Sync
  const priceAndProfitSync = (inputChanged, value) => {
    if (inputChanged === 'price' && value > entry.price) {
      // set profit %
      const diff = value - entry.price
      setProfit(roundNumbers((diff / entry.price) * 100, 2))
    }

    if (inputChanged === 'profit') {
      setPrice(entry.price * (1 + value / 100))
    }

    if (inputChanged === 'quantity' && value <= entry.quantity) {
      setQuantityPercentage(roundNumbers((value / entry.quantity) * 100, 4))
    }

    if ((inputChanged === 'quantityPercentage' && value < 101) || 
        (inputChanged === 'quantityPercentage' && value > 0)) {
      const theQuantity = (entry.quantity * value) / 100
      setQuantity(roundNumbers(theQuantity, 6))
    }

    return false
  }

  return (
    <TabNavigator labelArray={['Limit', 'Stop-market']}>
      <section style={{ marginTop: '2rem' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const symbol = selectedSymbolDetail['symbolpair']
            addTarget({
              price,
              quantity,
              profit,
              symbol,
            })
          }}
        >
          <InlineInput
            label="Price"
            type="number"
            onChange={(value) => {
              setPrice(value)
              priceAndProfitSync('price', value)
            }}
            value={price}
            placeholder="Target price"
            postLabel={ selectedSymbolDetail['quote_asset'] } 
          />

          <div className={classes.root}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Typography>
                Profit
                </Typography>
              </Grid>
              <Grid item xs className={classes.slider}>
                <Slider
                
                  defaultValue={0}
                  step={1}
                  marks={marks}
                  min={0}
                  max={100}
                  onChange={handleSliderChange}
                  value={profit}
                /> 
              </Grid>
              <Grid item>
                <InlineInput
                  className={classes.input}
                  value={profit}
                  margin="dense"
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  postLabel={ '%' }
                />
              </Grid>
            </Grid>
          </div>

          <InlineInput
            label="Quantity"
            type="number"
            onChange={(value) => {
              priceAndProfitSync('quantity', value)
              setQuantity(value)
            }}
            value={quantity}
            postLabel={isLoading ? "" : selectedSymbolDetail['base_asset']}
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
                  postLabel={ '%' }
                />
              </Grid>
            </Grid>
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
      <Typography as="h3">Not available yet.</Typography>
    </TabNavigator>
  )
}

export default ExitTarget
