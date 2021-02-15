import React, { Fragment, useState, useContext } from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import {
  addPrecisionToNumber,
  removeTrailingZeroFromInput,
  getMaxInputLength,
  getInputLength,
  convertCommaNumberToDot,
} from '../../helpers/tradeForm'

import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { TradeContext } from '../context/SimpleTradeContext'
import { useSymbolContext } from '../context/SymbolContext'

import { InlineInput, Button } from '../../components'

import * as yup from 'yup'

import styles from './MarketForm.module.css'

const MarketForm = () => {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolBalance,
    isLoadingBalance,
    selectedSymbolLastPrice,
  } = useSymbolContext()

  const { addMarketEntry } = useContext(TradeContext)

  const [values, setValues] = useState({
    price: '',
    quantity: '',
    total: '',
    quantityPercentage: '',
  })

  const [errors, setErrors] = useState({
    price: '',
    quantity: '',
    total: '',
  })

  const minNotional = Number(selectedSymbolDetail.minNotional)
  const maxQty = Number(selectedSymbolDetail.maxQty)
  const minQty = Number(selectedSymbolDetail.minQty)

  const quantityPrecision = selectedSymbolDetail['lotSize']
  const amountPercentagePrecision = 1
  const totalPrecision =
    selectedSymbolDetail['symbolpair'] === 'ETHUSDT'
      ? 7
      : selectedSymbolDetail['quote_asset_precision']

  const marks = {
    0: '',
    25: '',
    50: '',
    75: '',
    100: '',
  }

  // @TODO
  // Move schema to a different folder
  const formSchema = yup.object().shape({
    quantity: yup
      .number()
      .required('Amount is required')
      .typeError('Amount is required')
      .positive()
      .min(
        minQty,
        `Amount needs to meet min-price: ${addPrecisionToNumber(
          minQty,
          quantityPrecision
        )}`
      )
      .max(
        maxQty,
        `Amount needs to meet max-price: ${addPrecisionToNumber(
          maxQty,
          quantityPrecision
        )}`
      ),
    total: yup
      .number()
      .required('Total is required')
      .typeError('Total is required')
      .positive()
      .min(
        minNotional,
        `Total needs to meet min-trading: ${addPrecisionToNumber(
          minNotional,
          totalPrecision
        )}`
      )
      .max(selectedSymbolBalance, 'Total cannot not exceed your balance.'),
  })

  const calculatePercentageQuantityAndQuantityFromTotal = (value) => {
    const price = Number(values.price)
    const total = Number(value)

    const quantity = total / price

    const quantityWithPrecision =
      quantity === 0 ? '' : addPrecisionToNumber(quantity, quantityPrecision)

    const balance = selectedSymbolBalance
    const pq = (total * 100) / balance
    const percentageQuantityWithPrecision =
      pq > 100 ? 100 : parseFloat(pq.toFixed(0))

    return { quantityWithPrecision, percentageQuantityWithPrecision }
  }

  const calculateTotalAndPercentageQuantity = (value, key) => {
    const total = Number(value) * Number(values[key])
    const balance = selectedSymbolBalance

    const totalWithPrecision =
      total === 0 ? '' : addPrecisionToNumber(total, totalPrecision)

    const pq = (totalWithPrecision * 100) / balance
    const percentageQuantityWithPrecision =
      pq > 100 ? 100 : parseFloat(pq.toFixed(0))
    return { totalWithPrecision, percentageQuantityWithPrecision }
  }

  const validateInput = (target) => {
    const isValid = formSchema.fields[target.name]
      .validate(target.value)
      .catch((error) => {
        setErrors((errors) => ({
          ...errors,
          [target.name]: error.message,
        }))
      })

    if (isValid) {
      setErrors((errors) => ({
        ...errors,
        [target.name]: '',
      }))
    }
  }

  const handleChange = ({ target }) => {
    setErrors((errors) => ({
      ...errors,
      [target.name]: '',
    }))

    if (target.name === 'total') {
      const maxLength = getMaxInputLength(target.value, totalPrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return

      const {
        quantityWithPrecision,
        percentageQuantityWithPrecision,
      } = calculatePercentageQuantityAndQuantityFromTotal(target.value)

      setValues((values) => ({
        ...values,
        quantity: quantityWithPrecision,
        quantityPercentage: percentageQuantityWithPrecision,
        [target.name]: target.value,
      }))
    } else if (target.name === 'quantity') {
      const maxLength = getMaxInputLength(target.value, quantityPrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return

      const {
        totalWithPrecision,
        percentageQuantityWithPrecision,
      } = calculateTotalAndPercentageQuantity(target.value, 'price')

      setValues((values) => ({
        ...values,
        [target.name]: target.value,
        total: totalWithPrecision,
        quantityPercentage: percentageQuantityWithPrecision,
      }))

      validateInput({
        name: 'total',
        value: totalWithPrecision,
      })
    }

    validateInput(target)
  }

  const handleBlur = ({ target }, precision) => {
    validateInput(target)
    setValues((values) => ({
      ...values,
      [target.name]: addPrecisionToNumber(target.value, precision),
    }))
  }

  const calculateTotalAndQuantityFromSliderPercentage = (sliderValue) => {
    const balance = selectedSymbolBalance
    const sliderPercentage = Number(sliderValue) / 100
    const cost = addPrecisionToNumber(
      sliderPercentage * balance,
      totalPrecision
    )

    const quantityWithPrecision = addPrecisionToNumber(
      cost / parseFloat(selectedSymbolLastPrice),
      quantityPrecision
    )

    const totalWithPrecision = addPrecisionToNumber(
      quantityWithPrecision * selectedSymbolLastPrice,
      totalPrecision
    )

    return { totalWithPrecision, quantityWithPrecision }
  }

  const handleSlider = (newValue) => {
    const {
      quantityWithPrecision,
      totalWithPrecision,
    } = calculateTotalAndQuantityFromSliderPercentage(newValue)

    setValues((values) => ({
      ...values,
      quantityPercentage: newValue,
      quantity: quantityWithPrecision,
      total: totalWithPrecision,
    }))

    validateInput({
      name: 'quantity',
      value: quantityWithPrecision,
    })

    validateInput({
      name: 'total',
      value: totalWithPrecision,
    })
  }

  const handleSliderInputChange = ({ target }) => {
    const maxLength = getMaxInputLength(target.value, amountPercentagePrecision)
    const inputLength = getInputLength(target.value)
    if (inputLength > maxLength) return

    const value = removeTrailingZeroFromInput(Math.abs(target.value))

    const validatedValue = value > 100 ? 100 : value

    const {
      quantityWithPrecision,
      totalWithPrecision,
    } = calculateTotalAndQuantityFromSliderPercentage(validatedValue)
    setValues((values) => ({
      ...values,
      [target.name]: validatedValue,
      quantity: quantityWithPrecision,
      total: totalWithPrecision,
    }))

    validateInput({
      name: 'quantity',
      value: quantityWithPrecision,
    })

    validateInput({
      name: 'total',
      value: totalWithPrecision,
    })
  }

  const validateForm = () => {
    return formSchema.validate(values, { abortEarly: false }).catch((error) => {
      if (error.name === 'ValidationError') {
        error.inner.forEach((fieldError) => {
          setErrors((errors) => ({
            ...errors,
            [fieldError.path]: fieldError.message,
          }))
        })
      }
    })
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault()

    const isFormValid = await validateForm()

    if (isFormValid) {
      setErrors({ price: '', quantity: '', total: '' })
      const symbol = selectedSymbolDetail['symbolpair']

      const payload = {
        quantity: values.quantity,
        balance: selectedSymbolBalance,
        symbol,
        type: 'market',
      }
      addMarketEntry(payload)
    }
  }

  const renderInputValidationError = (errorKey) => (
    <>
      {errors[errorKey] && (
        <div className={styles['Error']}>{errors[errorKey]}</div>
      )}
    </>
  )

  return (
    <Fragment>
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
          <div className={styles['Input']}>
            <InlineInput
              label="Price"
              type="number"
              name="price"
              placeholder="Market"
              disabled
              postLabel={isLoading ? '' : selectedSymbolDetail['quote_asset']}
            />
          </div>

          <div className={styles['Input']}>
            <InlineInput
              label="Amount"
              type="text"
              name="quantity"
              onChange={handleChange}
              onBlur={(e) => handleBlur(e, quantityPrecision)}
              value={values.quantity}
              placeholder="Amount"
              postLabel={isLoading ? '' : selectedSymbolDetail['base_asset']}
            />
            {renderInputValidationError('quantity')}
          </div>

          <div className={styles['SliderRow']}>
            <div className={styles['SliderSlider']}>
              <Slider
                defaultValue={0}
                step={1}
                marks={marks}
                min={0}
                max={100}
                onChange={handleSlider}
                value={values.quantityPercentage}
              />
            </div>

            <div className={styles['SliderInput']}>
              <InlineInput
                value={values.quantityPercentage}
                margin="dense"
                onChange={handleSliderInputChange}
                postLabel={'%'}
                name="quantityPercentage"
                small
                type="text"
              />
            </div>
          </div>
          <div className={styles['Input']}>
            <InlineInput
              label="Total"
              type="text"
              name="total"
              value={values.total}
              onChange={handleChange}
              onBlur={(e) => handleBlur(e, totalPrecision)}
              placeholder=""
              postLabel={isLoading ? '' : selectedSymbolDetail['quote_asset']}
            />
            {renderInputValidationError('total')}
          </div>
          <Button variant="exits" type="submit">
            <span>
              Set exits
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-chevron-right"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          </Button>
        </form>
      </section>
    </Fragment>
  )
}

export default MarketForm
