import React, { Fragment, useState, useEffect, useContext } from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import roundNumbers from '../../helpers/roundNumbers'

import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { TradeContext } from '../context/SimpleTradeContext'
import { useSymbolContext } from '../context/SymbolContext'

import { InlineInput, Button } from '../../components'

import validate from '../../components/Validation/MarketValidation'

import styles from './MarketForm.module.css'

function MarketForm() {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolBalance,
    isLoadingBalance,
    //isLoadingLastPrice,
    selectedSymbolLastPrice,
  } = useSymbolContext()
  const { addMarketEntry } = useContext(TradeContext)
  const balance = selectedSymbolBalance
  // @TOOD:
  // Remove amount, and leave only quantity
  const [quantity, setQuantity] = useState('')
  const [quantityPercentage, setQuantityPercentage] = useState('')
  const [total, setTotal] = useState('')
  const [setIsValid] = useState(false) //isValid
  const [errors, setErrors] = useState({})
  const [validationFields, setValidationFields] = useState({})

  const marks = {
    0: '',
    25: '',
    50: '',
    75: '',
    100: '',
  }

  const handleSliderChange = (newValue) => {
    setQuantityPercentage(newValue)
    calculatePercentageQuantity('quantityPercentage', newValue)
  }

  const handleInputChange = (evt) => {
    const { value } = evt.target
    setQuantityPercentage(value === '' ? '' : Number(value))
    calculatePercentageQuantity('quantityPercentage', value)
  }

  const handleBlur = (evt) => {
    console.log('blurrring')
    if (quantity) {
      setErrors(validate(validationFields))
      console.log('SETTING ERRRORS')
    }
  }

  const calculatePercentageQuantity = (inputChanged, value) => {
    if (!selectedSymbolLastPrice) {
      return false
    }

    if (inputChanged === 'quantity') {
      setQuantityPercentage(((value * selectedSymbolLastPrice) / balance) * 100)
      setTotal(
        roundNumbers(
          value * selectedSymbolLastPrice,
          selectedSymbolDetail['tickSize']
        )
      )
    }

    if (inputChanged === 'quantityPercentage') {
      // how many BTC can we buy with the percentage?
      const belowOnePercentage = value / 100
      const cost = belowOnePercentage * balance
      const howManyBTC = roundNumbers(
        cost / selectedSymbolLastPrice,
        selectedSymbolDetail['lotSize']
      )
      setQuantity(howManyBTC)
      setTotal(
        roundNumbers(
          howManyBTC * selectedSymbolLastPrice,
          selectedSymbolDetail['tickSize']
        )
      )
    }
  }

  // CHECKER for isValid ? true : false
  useEffect(
    () => {
      setValidationFields((validationFields) => ({
        ...validationFields,
        selectedSymbolLastPrice,
        quantity,
        total: quantity * selectedSymbolLastPrice,
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

      let checkTotal = quantity * selectedSymbolLastPrice

      /*       const canAfford = checkTotal <= balance
      setIsValid(canAfford && quantity) */
    },
    [
      total,
      quantity,
      balance,
      setValidationFields,
      setIsValid,
      selectedSymbolDetail.minNotional,
      selectedSymbolLastPrice,
      selectedSymbolDetail.maxPrice,
      selectedSymbolDetail.minPrice,
      selectedSymbolDetail.maxQty,
      selectedSymbolDetail.minQty,
    ],
    () => {
      setTotal(0)
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
      console.log(Object.keys(errors).length)
      const symbol = selectedSymbolDetail['symbolpair']
      addMarketEntry({ quantity, balance, symbol, type: 'market' })
    }
  }

  const handleChange = (evt) => {
    const { name, value } = evt.target
    console.log(name)
    if (name === 'quantity') {
      setQuantity(value)
      console.log('setting quantity')
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
        {isLoadingBalance ? ' ' : selectedSymbolBalance}
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
            value={quantity || ''}
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
            value={total || ''}
            placeholder=""
            postLabel={isLoading ? '' : selectedSymbolDetail['quote_asset']}
            disabled
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

export default MarketForm
