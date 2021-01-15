import React, { Fragment, useState, useEffect, useContext } from 'react'
import { InlineInput } from '../../components'
import { TradeContext } from '../context/SimpleTradeContext'
import { useSymbolContext } from '../context/SymbolContext'
import { makeStyles } from '@material-ui/core/styles'
import Slider from 'rc-slider'
import Grid from '@material-ui/core/Grid'
import 'rc-slider/assets/index.css'
import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import validate from '../../components/Validation/Validation'

const useStyles = makeStyles({
  root: {
    width: 330,
  },
  input: {
    width: 42,
  },
})

function LimitForm() {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolBalance,
    isLoadingBalance,
  } = useSymbolContext()
  const { addEntry } = useContext(TradeContext)
  const balance = selectedSymbolBalance
  const [price, setPrice] = useState('')
  // @TOOD:
  // Remove amount, and leave only quantity
  const [quantity, setQuantity] = useState('')
  const [quantityPercentage, setQuantityPercentage] = useState()
  const [total, setTotal] = useState('')
  const [isValid, setIsValid] = useState(false)

  const [fValues, setFValues] = useState({
    price: '',
    quantity: '',
    quantityPercentage: '',
    total: '',
  }) // hold form values to submit
  const [errors, setErrors] = useState({})

  // alfa precise
  const precise = (num = 2) => {
    return Number.parseFloat(num).toFixed(8) //toPrecision from backend
  }

  /*   const addZeros = (decimal = 8, value, check = true) => {
    if (check && decimal <= value.length) return value
    if (check && decimal <= value) return value
    if (decimal <= 0) return value
    const newValue = value.length <= decimal ? '0' + value : value
    return addZeros(decimal - 1, newValue, false)
  } */
  const classes = useStyles()
  const marks = {
    0: '',
    25: '',
    50: '',
    75: '',
    100: '',
  }

  const round = (value, decimals) => {
    if (value === 0) {
      return 0
    }

    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
  }

  const handleSliderChange = (newValue) => {
    setQuantityPercentage(newValue)
    calculatePercentageQuantity('quantityPercentage', newValue)
  }

  const handleInputChange = (value) => {
    setQuantityPercentage(value === '' ? '' : Number(value))
    calculatePercentageQuantity('quantityPercentage', value)
  }

  const handleBlur = () => {
    if (quantityPercentage < 0) {
      setQuantityPercentage(0)
      calculatePercentageQuantity('quantityPercentage', 0)
    } else if (quantityPercentage > 100) {
      setQuantityPercentage(100)
      calculatePercentageQuantity('quantityPercentage', 100)
    }
  }

  const calculatePercentageQuantity = (inputChanged, value) => {
    if (inputChanged === 'price') {
      setPrice(value)

      if (quantity) {
        setQuantityPercentage(((value * fValues.quantity) / balance) * 100)
        setTotal(precise(value * fValues.quantity))
        setFValues((fValues) => ({
          ...fValues,
          total: value * fValues.quantity,
        }))
      }
    }

    /*     if (!price) {
      return false
    } */

    if (inputChanged === 'quantity') {
      setQuantity(value)

      if (price) {
        setQuantityPercentage(((value * fValues.price) / balance) * 100)
        setTotal(precise(value * fValues.price))

        setFValues((fValues) => ({
          ...fValues,
          total: value * fValues.price,
        }))
      }

      //setTotal(precise(fValues.value * fValues.price))
      //setTotal(value * price)
    }

    if (inputChanged === 'quantityPercentage') {
      // how many BTC can we buy with the percentage?
      const belowOnePercentage = value / 100
      const cost = belowOnePercentage * balance
      const howManyBTC = cost / fValues.price
      setQuantityPercentage(value)
      setQuantity(howManyBTC)
      setTotal(precise(howManyBTC * fValues.price))
    }

    if (inputChanged === 'total') {
      console.log('totalAmount')
      //const belowOnePercentage = value / 100
      //const cost = belowOnePercentage * balance
      //const howManyBTC = total / price
      setTotal(precise(value))
      setQuantity(value * fValues.price)
      //setQuantityPercentage(howManyBTC / total)
      setQuantityPercentage(((total * fValues.price) / balance) * 100)
    }
  }

  // CHECKER for isValid ? true : false
  useEffect(
    () => {
      /*       console.log('useEffect price', price)
      console.log('useEffect quantity', quantity)
      console.log('useEffect total', total)
      console.log('useEffect errors ', errors)
      console.log('useEffect fValues ', fValues)
 */
      if (!price || !quantity) {
        return false
      }

      const canAfford = total <= balance
      setIsValid(canAfford && price && quantity)
    },
    [total, price, quantity, balance, errors],
    () => {
      setTotal(0)
      setPrice(0)
    }
  )
  // handle errors object
  useEffect(() => {
    //console.log('useEffect Errors', errors)

    if (Object.keys(errors).length === 0 && isValid) {
      //console.log('form ready to submit no errors')
    }
  }, [fValues, isValid, errors])

  const handleSubmit = (evt) => {
    evt.preventDefault()

    setErrors(validate(fValues))
    const { price, quantity } = fValues

    console.log('handleSubmit values : ', fValues)
    console.log('addEntry :', { price, quantity, type: 'limit' })

    //addEntry({ price, quantity, type: 'limit' })
  }

  const handleChange = (evt) => {
    evt.preventDefault()

    const { name, value } = evt.target

    setFValues((fValues) => ({
      ...fValues,
      [name]: value,
    }))

    calculatePercentageQuantity(name, value)
  }

  return (
    <Fragment>
      {/*       <div style={{ marginTop: '2rem' }}>
        <Typography as="h3">1. Entry</Typography>
      </div> */}

      <div>
        <FontAwesomeIcon icon={faWallet} />
        {'  '}
        {isLoadingBalance
          ? ' '
          : round(
              selectedSymbolBalance,
              selectedSymbolDetail['quote_asset_precision']
            )}
        {'  '}
        {selectedSymbolDetail['quote_asset']}
        {'  '}
        {isLoadingBalance ? (
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          />
        ) : (
          ''
        )}
      </div>

      <section>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const symbol = selectedSymbolDetail['symbolpair']
            addEntry({ price, quantity, symbol, type: 'limit' })
          }}
        >
          <InlineInput
            label="Price"
            type="number"
            onChange={handleChange}
            value={price}
            name="price"
            placeholder="Entry price"
            postLabel={isLoading ? '' : selectedSymbolDetail['quote_asset']}
          />
          {errors.price && (
            <div className="error" style={{ color: 'red' }}>
              {errors.price}
            </div>
          )}

          <InlineInput
            label="Amount"
            type="number"
            onChange={(value) => {
              setQuantity(value)
              calculatePercentageQuantity('quantity', value)
            }}
            value={quantity}
            placeholder="Amount"
            postLabel={isLoading ? '' : selectedSymbolDetail['base_asset']}
          />
          <div className={classes.root}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Slider
                  defaultValue={0}
                  step={1}
                  marks={marks}
                  min={0}
                  max={100}
                  onChange={handleSliderChange}
                  value={quantityPercentage}
                />
              </Grid>
              <Grid item>
                <InlineInput
                  className={classes.input}
                  value={quantityPercentage}
                  margin="dense"
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  postLabel={'%'}
                />
              </Grid>
            </Grid>
          </div>

          <InlineInput
            label="Total"
            type="number"
            value={total}
            placeholder=""
            postLabel={isLoading ? '' : selectedSymbolDetail['quote_asset']}
            disabled
          />
          {errors.total && (
            <div className="error" style={{ color: 'red' }}>
              {errors.total}
            </div>
          )}

          <button
            /* disabled={isValid ? null : 'disabled'} */
            type="submit"
          >
            Next: Exits
          </button>
        </form>
      </section>
    </Fragment>
  )
}

export default LimitForm
