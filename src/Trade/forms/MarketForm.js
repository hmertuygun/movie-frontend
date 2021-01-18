import React, { Fragment, useState, useEffect, useContext } from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { TradeContext } from '../context/SimpleTradeContext'
import { useSymbolContext } from '../context/SymbolContext'

import { Typography, InlineInput, Button } from '../../components'

import validate from '../../components/Validation/MarketValidation'

import styles from './MarketForm.module.css'

function MarketForm() {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolBalance,
    isLoadingBalance,
  } = useSymbolContext()
  const { addMarketEntry } = useContext(TradeContext)
  const balance = selectedSymbolBalance
  const [price, setPrice] = useState('')
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
    if (quantity) {
        setErrors(validate(validationFields))
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
      const howManyBTC = cost / price
      setQuantity(howManyBTC)
      setTotal(howManyBTC * price)
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

      if (!quantity) {
        return false
      }

      /*       const canAfford = total <= balance
      setIsValid(canAfford && price && quantity) */
    },
    [
      total,
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

    setErrors(validate(validationFields))
    /*
    const canAfford = total <= balance

    if (canAfford) {
      setIsValid(true)
    }
    */
    setIsValid(true)

    if (Object.keys(errors).length === 0) {
      const symbol = selectedSymbolDetail['symbolpair']
      addMarketEntry({ quantity, balance, symbol, type: 'market' })
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
        <Typography as="h3">1. Entry</Typography>
      </div>

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
            name="price"
            placeholder="Market"
            disabled
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
                disabled
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
                disabled
              />
            </div>
          </div>

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

export default MarketForm
