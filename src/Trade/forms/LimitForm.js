import React, { Fragment, useState, useEffect, useContext } from 'react'
import { InlineInput } from '../../components'
import { TradeContext } from '../context/SimpleTradeContext'

import validate from '../../components/Validation/Validation'

function LimitForm() {
  const { addEntry } = useContext(TradeContext)
  const balance = 20000
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
    [total, price, quantity, errors],
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
      <div>BALANCE</div>

      <section>
        <form onSubmit={handleSubmit}>
          <InlineInput
            label="Price"
            type="number"
            onChange={handleChange}
            value={price}
            name="price"
            placeholder="Entry price"
            postLabel="USDT"
          />
          {errors.price && (
            <div className="error" style={{ color: 'red' }}>
              {errors.price}
            </div>
          )}

          <InlineInput
            label="Amount"
            type="number"
            name="quantity"
            onChange={handleChange}
            value={quantity || ''}
            placeholder="Amount - (quantity)"
            postLabel="BTC"
          />
          {errors.quantity && (
            <div className="error" style={{ color: 'red' }}>
              {errors.quantity}
            </div>
          )}

          <InlineInput
            type="number"
            name="quantityPercentage"
            onChange={handleChange}
            value={quantityPercentage || ''}
            placeholder="Amount - (quantityPercentage)"
            postLabel="%"
          />

          <InlineInput
            label="Total"
            type="number"
            onChange={handleChange}
            name="total"
            value={total || ''}
            placeholder="total amount"
            postLabel="USDT"
            //min={10}
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
