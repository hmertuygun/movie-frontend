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

  const handleInputChange = (value) => {
    setQuantityPercentage(value === '' ? '' : Number(value))
    calculatePercentageQuantity('quantityPercentage', value)
  }

  const handleBlur = (evt) => {
    const { value, name } = evt.target

    if (name === 'quantity') {
      /*       if (price) {
        setErrors(validate(validationFields))
      } */

      const newValue =
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

      const valueFormated = precisionRound(newValue, 8)
      setTotal(valueFormated)

      if (quantity) {
        const valueFormated = precisionRound(quantity, 6)
        setQuantity(valueFormated)
      }
    }

    if (name === 'total') {
      const newValue = (value / price)
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

      const valueFormated = precisionRound(newValue, 6)
      setQuantity(valueFormated)

      if (total) {
        const valueFormated = precisionRound(total, 8)
        setTotal(valueFormated)
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
      if (!quantity) {
        return false
      }
      setTotal(
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
      )
    }

    if (inputChanged === 'quantity') {
      setQuantityPercentage(((value * price) / balance) * 100)
      /*       setTotal(
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
      ) */

      setTotal(
        roundNumbers(
          value * price,
          selectedSymbolDetail['base_asset_precision']
        )
      )
    }

    if (inputChanged === 'quantityPercentage') {
      // how many BTC can we buy with the percentage?
      const belowOnePercentage = value / 100
      const cost = belowOnePercentage * balance
      const howManyBTC = roundNumbers(
        cost / price,
        selectedSymbolDetail['lotSize']
      )
      setQuantity(howManyBTC)
      setTotal(
        roundNumbers(howManyBTC * price, selectedSymbolDetail['tickSize'])
      )
    }

    if (inputChanged === 'amount') {
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
      setPrice(
        value
          .toString()
          .split('.')
          .map((el, i) =>
            i
              ? el.split('').slice(0, selectedSymbolDetail['tickSize']).join('')
              : el
          )
          .join('.')
      )
      calculatePercentageQuantity('price', value)
    }
    if (name === 'quantity') {
      setQuantity(
        value
          .toString()
          .split('.')
          .map((el, i) =>
            i
              ? el.split('').slice(0, selectedSymbolDetail['lotSize']).join('')
              : el
          )
          .join('.')
      )
      //calculatePercentageQuantity('quantity', value)
    }

    if (name === 'total') {
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
