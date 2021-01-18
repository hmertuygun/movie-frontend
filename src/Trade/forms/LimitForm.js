import React, { Fragment, useState, useEffect, useContext } from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import roundNumbers from '../../helpers/roundNumbers'

import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { TradeContext } from '../context/SimpleTradeContext'
import { useSymbolContext } from '../context/SymbolContext'

import { Typography, InlineInput, Button } from '../../components'

import validate from '../../components/Validation/Validation'

import styles from './LimitForm.module.css'

function LimitForm() {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolBalance,
    isLoadingBalance,
    selectedSymbolLastPrice
  } = useSymbolContext()
  const { addEntry } = useContext(TradeContext)
  const balance = selectedSymbolBalance
  const [price, setPrice] = useState(roundNumbers(selectedSymbolLastPrice,selectedSymbolDetail['tickSize']))
  // @TOOD:
  // Remove amount, and leave only quantity
  const [quantity, setQuantity] = useState('')
  const [quantityPercentage, setQuantityPercentage] = useState('')
  const [total, setTotal] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [errors, setErrors] = useState({})
  const [validationFields, setValidationFields] = useState({})

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

  const handleBlur = (evt) => {
    if (price) {
      /*       if (!price && !quantity) {
        return false
      } */

      if (quantity) {
        if (!price || !quantity) {
          return false
        }
        setErrors(validate(validationFields))
      }
    }

    if (quantity) {
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
    if (!price) {
      return false
    }

    if (inputChanged === 'quantity') {
      setQuantityPercentage(((value * price) / balance) * 100)
      setTotal(value * price)
    }

    if (inputChanged === 'quantityPercentage') {
      // how many BTC can we buy with the percentage?
      const belowOnePercentage = value / 100
      const cost = belowOnePercentage * balance
      const howManyBTC = roundNumbers(cost / price, selectedSymbolDetail['lotSize'])

      setQuantity(howManyBTC)
      setTotal(
        roundNumbers(howManyBTC * price, selectedSymbolDetail['tickSize'])
        )
    }
  }

  // CHECKER for isValid ? true : false
  useEffect(
    () => {
      setValidationFields((validationFields) => ({
        ...validationFields,
        price,
        quantity,
        total: quantity * price,
        balance: balance,
        minNotional: selectedSymbolDetail.minNotional,
        maxPrice: selectedSymbolDetail.maxPrice,
        minPrice: selectedSymbolDetail.minPrice,
        maxQty: selectedSymbolDetail.maxQty,
        minQty: selectedSymbolDetail.minQty,
      }))

      if (!price || !quantity) {
        return false
      }

      /*       const canAfford = total <= balance
      setIsValid(canAfford && price && quantity) */
    },
    [
      total,
      price,
      quantity,
      balance,
      selectedSymbolDetail.minNotional,
      setValidationFields,
    ],
    () => {
      setTotal(0)
      setPrice(0)
    }
  )

  const handleSubmit = (evt) => {
    evt.preventDefault()
    const x = validate(validationFields)
    setErrors(x)
    const canAfford = total <= balance

    if (canAfford) {
      setIsValid(true)
    }

    if (Object.keys(x).length === 0 && canAfford) {
      const symbol = selectedSymbolDetail['symbolpair']
      addEntry({ price, quantity, balance, symbol, type: 'limit' })
    }
  }

  const handleChange = (evt) => {
    const { name, value } = evt.target

    if (name === 'price') {
      setPrice(value)
    }
    if (name === 'quantity') {
      setQuantity(value)
      calculatePercentageQuantity('quantity', value)
    }
    if (name === 'total') {
      setTotal(value)
    }

    /*     setValidationFields((validationFields) => ({
      ...validationFields,
      [name]: value,
      total: quantity * price,
      balance: balance,
      minNotional: selectedSymbolDetail.minNotional,
    })) */
  }

  return (
    <Fragment>
      <div style={{ marginTop: '2rem' }}>
        <FontAwesomeIcon icon={faWallet} />
        {'  '}
        {isLoadingBalance
          ? ' '
          : 
              selectedSymbolBalance
            }
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
            name="price"
            onChange={handleChange}
            onBlur={handleBlur}
            value={price}
            placeholder="Entry price"
            //onInput={(value) => restrict(value)}
            //onInput={restrict}
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
            name="total"
            value={total}
            onChange={handleChange}
            placeholder=""
            postLabel={isLoading ? '' : selectedSymbolDetail['quote_asset']}
            //disabled
          />
          {errors.total && (
            <div className="error" style={{ color: 'red' }}>
              {errors.total}
            </div>
          )}

          <Button
            variant="exits"
            //disabled={isValid ? null : 'disabled'}
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
