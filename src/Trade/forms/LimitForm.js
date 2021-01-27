import React, { Fragment, useState, useEffect, useContext } from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import roundNumbers from '../../helpers/roundNumbers'
import precisionRound from '../../helpers/precisionRound'

import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { TradeContext } from '../context/SimpleTradeContext'
import { useSymbolContext } from '../context/SymbolContext'

import { InlineInput, Button } from '../../components'

import validate from '../../components/Validation/Validation'

import styles from './LimitForm.module.css'

function LimitForm() {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolBalance,
    isLoadingBalance,
    selectedSymbolLastPrice,
  } = useSymbolContext()
  const { addEntry } = useContext(TradeContext)
  const balance = selectedSymbolBalance
  const [price, setPrice] = useState(
    roundNumbers(selectedSymbolLastPrice, selectedSymbolDetail['tickSize'])
  )
  // @TOOD:
  // Remove amount, and leave only quantity
  const [quantity, setQuantity] = useState('')
  const [quantityPercentage, setQuantityPercentage] = useState('')
  const [total, setTotal] = useState('')
  //const [isValid, setIsValid] = useState(false)
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
      if (price) {
        setTotal(0)
      }
      if (!quantity) {
        setQuantity(0)
        setTotal(0)
      } else {
        const newValueQtd = quantity
          .toString()
          .split('.')
          .map((el, i) =>
            i
              ? el.split('').slice(0, selectedSymbolDetail['lotSize']).join('')
              : el
          )
          .join('.')

        const valueFormatedQtd = precisionRound(
          newValueQtd,
          selectedSymbolDetail['lotSize']
        )
        setQuantity(valueFormatedQtd)
        const newValueTotal =
          value *
          quantity
            .toString()
            .split('.')
            .map((el, i) =>
              i
                ? el
                    .split('')
                    .slice(0, selectedSymbolDetail['base_asset_precision'])
                    .join('')
                : el
            )
            .join('.')

        const valueFormatedTotal = precisionRound(
          newValueTotal,
          selectedSymbolDetail['base_asset_precision']
        )
        setTotal(valueFormatedTotal)
      }
    }

    if (inputChanged === 'quantity') {
      setQuantityPercentage(((value * price) / balance) * 100)

      if (!price) {
        return false
      }
      const newTotalValue =
        value *
        price
          .toString()
          .split('.')
          .map((el, i) =>
            i
              ? el
                  .split('')
                  .slice(0, selectedSymbolDetail['base_asset_precision'])
                  .join('')
              : el
          )
          .join('.')

      const valueFormatedQtd = precisionRound(
        newTotalValue,
        selectedSymbolDetail['base_asset_precision']
      )
      setTotal(valueFormatedQtd)
    }

    if (inputChanged === 'quantityPercentage') {
      // how many BTC can we buy with the percentage?
      const belowOnePercentage = value / 100
      const cost = belowOnePercentage * balance

      const howManyBTC = precisionRound(
        cost / price,
        selectedSymbolDetail['lotSize']
      )

      setQuantity(howManyBTC)

      /*   const newValue =
        howManyBTC *
        price
          .toString()
          .split('.')
          .map((el, i) =>
            i
              ? el
                  .split('')
                  .slice(0, selectedSymbolDetail['base_asset_precision'])
                  .join('')
              : el
          )
          .join('.') */

      const valueFormatedTotal = precisionRound(
        cost,
        selectedSymbolDetail['base_asset_precision']
      )

      setTotal(valueFormatedTotal)
    }

    if (inputChanged === 'amount') {
      setQuantityPercentage((100 * value) / balance)

      const quantityformat = (value / price)
        .toString()
        .split('.')
        .map((el, i) =>
          i
            ? el
                .split('')
                .slice(0, selectedSymbolDetail['base_asset_precision'])
                .join('')
            : el
        )
        .join('.')
      setQuantity(quantityformat)
    }

    if (inputChanged === 'amount') {
      const newValueQtd = (value / price)
        .toString()
        .split('.')
        .map((el, i) =>
          i
            ? el.split('').slice(0, selectedSymbolDetail['lotSize']).join('')
            : el
        )
        .join('.')

      const valueToPrecision = precisionRound(
        newValueQtd,
        selectedSymbolDetail['lotSize']
      )

      setQuantity(valueToPrecision)
    }
  }

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
    },
    [
      total,
      price,
      quantity,
      balance,
      selectedSymbolDetail.minNotional,
      selectedSymbolDetail.maxPrice,
      selectedSymbolDetail.minPrice,
      selectedSymbolDetail.maxQty,
      selectedSymbolDetail.minQty,
      setValidationFields,
      selectedSymbolDetail,
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

    const canAfford = parseFloat(total) <= parseFloat(balance)

    /*     if (canAfford) {
      setIsValid(true)
    } */

    if (Object.keys(x).length === 0 && canAfford) {
      const symbol = selectedSymbolDetail['symbolpair']

      console.log('add entry ', {
        price,
        quantity,
        balance,
        symbol,
        type: 'limit',
      })
      addEntry({ price, quantity, balance, symbol, type: 'limit' })
    }
  }

  const handleChange = (evt) => {
    const { name, value } = evt.target

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
      calculatePercentageQuantity('price', newValuePrice)
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

      calculatePercentageQuantity('quantity', valueFormatedQtd)
    }

    if (name === 'total') {
      if (!price) {
        setTotal(0)
      }
      setTotal(
        value
          .toString()
          .split('.')
          .map((el, i) =>
            i
              ? el
                  .split('')
                  .slice(0, selectedSymbolDetail['base_asset_precision'])
                  .join('')
              : el
          )
          .join('.')
      )
      calculatePercentageQuantity('amount', value)
    }
  }

  return (
    <Fragment>
      {/* <div style={{ margin: '1rem 0', textAlign: 'center' }}></div> */}
      <div style={{ marginTop: '0.8rem', marginBottom: '0.8rem' }}>
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
            onChange={handleChange}
            onBlur={handleBlur}
            value={price || ''}
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
                disabled={!price}
              />
            </div>

            <div className={styles['SliderInput']}>
              <InlineInput
                type="number"
                value={quantityPercentage}
                margin="dense"
                onChange={handleInputChange}
                onBlur={handleBlur}
                postLabel={'%'}
                disabled={!price}
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
            onBlur={handleBlur}
            placeholder=""
            postLabel={isLoading ? '' : selectedSymbolDetail['quote_asset']}
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
