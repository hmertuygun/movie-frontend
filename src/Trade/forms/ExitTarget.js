import React, { useState, useEffect, useContext } from 'react'
import { InlineInput, Button, TabNavigator, Typography } from '../../components'
import { TradeContext } from '../context/SimpleTradeContext'
import roundNumbers from '../../helpers/roundNumbers'
import { useSymbolContext } from '../context/SymbolContext'
import validate from '../../components/Validation/ValidationTarget'
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

const ExitTarget = () => {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolBalance,
    selectedSymbolLastPrice
  } = useSymbolContext()
  const balance = selectedSymbolBalance

  const [profit, setProfit] = useState(0)
  const [quantity, setQuantity] = useState('')
  const [quantityPercentage, setQuantityPercentage] = useState('')
  const [total, setTotal] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [errors, setErrors] = useState({})
  const [validationFields, setValidationFields] = useState({})

  const { addTarget, addStopMarketTarget, state } = useContext(TradeContext)
  // ingoing value
  const { entry } = state
  const [price, setPrice] = useState(roundNumbers(entry.type == "market" ? selectedSymbolLastPrice : entry.price, selectedSymbolDetail['tickSize']))

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

  const handleInputChange = (value) => {
    setProfit(value === '' ? '' : Number(value))
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
      setPrice(value)
      priceAndProfitSync('price', value)
    }

    if (name === 'quantity') {
      setQuantity(value)
      priceAndProfitSync('quantity', value)
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
      maxPrice: selectedSymbolDetail.maxPrice,
      minPrice: selectedSymbolDetail.minPrice,
      maxQty: selectedSymbolDetail.maxQty,
      minQty: selectedSymbolDetail.minQty,
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
    let usePrice = (entry.type == "market" ? selectedSymbolLastPrice : entry.price)

    if (inputChanged === 'price' && value > usePrice) {
      // set profit %
      const diff = value - usePrice
      setProfit(roundNumbers((diff / usePrice) * 100, 2))
    }

    if (inputChanged === 'profit') {
      setPrice(roundNumbers(usePrice * (1 + value / 100), selectedSymbolDetail['tickSize']))
    }

    if (inputChanged === 'quantity' && value <= entry.quantity) {
      setQuantityPercentage(roundNumbers((value / entry.quantity) * 100, 2))
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
            name="price"
            onChange={handleChange}
            /*             onChange={(value) => {
              setPrice(value)
              priceAndProfitSync('price', value)
            }} */
            value={price}
            placeholder="Target price"
            postLabel={selectedSymbolDetail['quote_asset']}
          />

          <div className={classes.root}>
            <div className={styles['SliderRow']}>
            <div className={styles['SliderText']}>
                <Typography>
                Profit
                </Typography>
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
                />
              </div>
          </div>
          </div>

          <InlineInput
            label="Quantity"
            type="number"
            name="quantity"
            /*             onChange={(value) => {
              priceAndProfitSync('quantity', value)
              setQuantity(value)
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

export default ExitTarget
