import React, { Fragment, useState, useEffect, useContext } from 'react'
import { TradeContext } from '../context/SimpleTradeContext'
import { useSymbolContext } from '../context/SymbolContext'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import validate from '../../components/Validation/Validation'

import { InlineInput, Button } from '../../components'

import styles from './LimitForm.module.css'

function LimitForm() {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolBalance,
    isLoadingBalance,
  } = useSymbolContext()
  const { addEntry } = useContext(TradeContext)
  const balance = selectedSymbolBalance
  const precisionNumber = selectedSymbolDetail.base_asset_precision
  const [price, setPrice] = useState('')
  // @TOOD:
  // Remove amount, and leave only quantity
  const [quantity, setQuantity] = useState('')
  const [quantityPercentage, setQuantityPercentage] = useState()
  const [total, setTotal] = useState('')
  const [isValid, setIsValid] = useState(false)

  // validationFields/fValues  setValidationFields/setFValues
  const [validationFields, setValidationFields] = useState({
    price: '',
    quantity: '',
    quantityPercentage: '',
    total: '',
    balance: '',
    minNotional: '',
  })
  const [errors, setErrors] = useState({})

  const precise = (num) => {
    return Number.parseFloat(num).toFixed(precisionNumber) //toPrecision from backend
  }

  const precisePrice = (num) => {
    return Number.parseFloat(num).toFixed(2) //need to confirm price precision from BE
  }

  const preciseAmount = (num) => {
    return Number.parseFloat(num).toFixed(precisionNumber) //toPrecision from backend
  }
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

  const handleBlur = (e) => {
    const { value, name } = e.target

    if (name === 'price') {
      if (!price && !quantity) {
        return false
      }
      // setprice to precision
      setPrice(precisePrice(value))

      if (quantity) {
        if (!price || !quantity) {
          return false
        }
        setErrors(validate(validationFields))
      }
    }

    if (name === 'quantity') {
      setQuantity(preciseAmount(value))
      console.log('amount field ', quantity)
      if (price) {
        setErrors(validate(validationFields))
      }
    }

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
        setQuantityPercentage(
          ((value * validationFields.quantity) / balance) * 100
        )
        setTotal(precise(value * validationFields.quantity))
        setValidationFields((validationFields) => ({
          ...validationFields,
          total: value * validationFields.quantity,
        }))
      }
    }

    if (inputChanged === 'quantity') {
      setQuantity(value)
      if (price) {
        setQuantityPercentage(
          ((value * validationFields.price) / balance) * 100
        )
        setTotal(precise(value * validationFields.price))

        setValidationFields((validationFields) => ({
          ...validationFields,
          total: value * validationFields.price,
          balance: balance,
          minNotional: selectedSymbolDetail.minNotional,
        }))
      }
    }

    if (inputChanged === 'quantityPercentage') {
      // how many BTC can we buy with the percentage?
      const belowOnePercentage = value / 100
      const cost = belowOnePercentage * balance
      const howManyBTC = cost / validationFields.price
      setQuantityPercentage(value)
      setQuantity(howManyBTC)
      setTotal(precise(howManyBTC * validationFields.price))
    }

    if (inputChanged === 'total') {
      //const belowOnePercentage = value / 100
      //const cost = belowOnePercentage * balance
      //const howManyBTC = total / price
      setTotal(precise(value))
      setQuantity(value * validationFields.price)
      //setQuantityPercentage(howManyBTC / total)
      setQuantityPercentage(((total * validationFields.price) / balance) * 100)
    }
  }

  // CHECKER for isValid ? true : false
  useEffect(
    () => {},
    [
      total,
      price,
      quantity,
      errors,
      isValid,
      addEntry,
      balance,
      selectedSymbolDetail,
    ],
    () => {
      setTotal(0)
      setPrice(0)
    }
  )

  const handleSubmit = (evt) => {
    evt.preventDefault()

    setErrors(validate(validationFields))

    const canAfford = parseInt(total) <= parseInt(balance)

    if (canAfford) {
      setIsValid(true)
    }

    if (Object.keys(errors).length === 0 && isValid) {
      const symbol = selectedSymbolDetail['symbolpair']
      addEntry({ price, quantity, symbol, type: 'limit' })
    }
  }

  const handleChange = (evt) => {
    evt.preventDefault()
    const { name, value } = evt.target

    console.log('handleChange name & value ', name, value)

    setValidationFields((validationFields) => ({
      ...validationFields,
      [name]: value,
    }))

    console.log('validationFields ', validationFields)

    calculatePercentageQuantity(name, value)
  }

  return (
    <Fragment>
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
        <form onSubmit={handleSubmit}>
          <InlineInput
            label="Price"
            type="number"
            onChange={handleChange}
            onBlur={(e) => handleBlur(e)}
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
            name="quantity"
            /*             onChange={(value) => {
              setQuantity(value)
              calculatePercentageQuantity('quantity', value)
            }} */
            onChange={handleChange}
            onBlur={handleBlur}
            value={quantity}
            placeholder="Amount"
            postLabel={isLoading ? '' : selectedSymbolDetail['base_asset']}
          />
          {errors.quantity && (
            <div className="error" style={{ color: 'red' }}>
              {errors.quantity}
            </div>
          )}

          <div className={styles['SliderRow']}>
            <div className={styles['SliderSlider']}>
              <Slider
                defaultValue={0}
                step={1}
                marks={marks}
                min={0}
                max={100}
                onChange={handleSliderChange}
                value={quantityPercentage}
              />
            </div>

            <div className={styles['SliderInput']}>
              <InlineInput
                value={quantityPercentage}
                margin="dense"
                onChange={handleInputChange}
                onBlur={handleBlur}
                postLabel={'%'}
                small
              />
            </div>
          </div>

          <InlineInput
            label="Total"
            type="number"
            onChange={handleChange}
            name="total"
            value={total || ''}
            placeholder=""
            //disabled
            postLabel={isLoading ? '' : selectedSymbolDetail['quote_asset']}
          />
          {errors.total && (
            <div className="error" style={{ color: 'red' }}>
              {errors.total}
            </div>
          )}
          <Button
            variant="exits"
            /* disabled={isValid ? null : 'disabled'} */
            type="submit"
          >
            Set exits >
          </Button>
        </form>
      </section>
    </Fragment>
  )
}

export default LimitForm
