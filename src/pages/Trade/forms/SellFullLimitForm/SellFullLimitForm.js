/* eslint-disable react-hooks/exhaustive-deps */
import React, { Fragment, useState, useEffect } from 'react'
import Slider from 'rc-slider'
import { useNotifications } from 'reapop'
import { faWallet, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as yup from 'yup'

import {
  addPrecisionToNumber,
  removeTrailingZeroFromInput,
  getMaxInputLength,
  getInputLength,
  convertCommaNumberToDot,
  allowOnlyNumberDecimalAndComma,
} from 'utils/tradeForm'
import { useSymbolContext } from 'contexts/SymbolContext'
import { InlineInput, Button } from 'components'
import roundNumbers from 'utils/roundNumbers'
// eslint-disable-next-line css-modules/no-unused-class
import styles from './SellFullLimitForm.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { addEntry } from 'store/actions'

const SellFullLimitForm = () => {
  const { isLoading, refreshBalance } = useSymbolContext()
  const {
    selectedSymbolDetail,
    selectedBaseSymbolBalance,
    isLoadingBalance,
    selectedSymbolLastPrice,
  } = useSelector((state) => state.symbols)
  const { notify } = useNotifications()
  const dispatch = useDispatch()
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

  const minNotional =
    selectedSymbolDetail && Number(selectedSymbolDetail.minNotional)
  const maxPrice = selectedSymbolDetail && Number(selectedSymbolDetail.maxPrice)
  const minPrice = selectedSymbolDetail && Number(selectedSymbolDetail.minPrice)
  const minQty = selectedSymbolDetail && Number(selectedSymbolDetail.minQty)

  const amountPercentagePrecision = 1
  const tickSize = selectedSymbolDetail && selectedSymbolDetail['tickSize']
  const pricePrecision = tickSize > 8 ? '' : tickSize

  const quantityPrecision =
    selectedSymbolDetail && selectedSymbolDetail['lotSize']
  const symbolPair = selectedSymbolDetail && selectedSymbolDetail['symbolpair']
  const quoteAssetPrecision =
    selectedSymbolDetail && selectedSymbolDetail['quote_asset_precision']
  const totalPrecision = symbolPair === 'ETHUSDT' ? 7 : quoteAssetPrecision

  const sliderMarks = {
    0: '',
    25: '',
    50: '',
    75: '',
    100: '',
  }

  useEffect(() => {
    setValues({
      price: '',
      quantity: '',
      total: '',
      quantityPercentage: '',
    })
  }, [selectedSymbolDetail])

  // @TODO
  // Move schema to a different folder
  const formSchema = yup.object().shape({
    price: minPrice
      ? yup
          .number()
          .required('Price is required')
          .typeError('Price is required')
          .min(
            minPrice,
            `Price needs to meet min-price: ${addPrecisionToNumber(
              minPrice,
              pricePrecision
            )}`
          )
          .max(
            maxPrice,
            `Price needs to meet max-price: ${addPrecisionToNumber(
              maxPrice,
              pricePrecision
            )}`
          )
      : yup
          .number()
          .required('Price is required')
          .typeError('Price is required'),
    quantity: yup
      .number()
      .required('Amount is required')
      .typeError('Amount is required')
      .positive()
      .min(
        minQty,
        `Amount needs to meet min-quantity: ${addPrecisionToNumber(
          minQty,
          quantityPrecision
        )}`
      )
      .max(selectedBaseSymbolBalance, `Amount cannot exceed your balance`),
    total: yup
      .number()
      .required('Total is required')
      .typeError('Total is required')
      .min(
        minNotional,
        `Total needs to meet min-trading: ${addPrecisionToNumber(
          minNotional,
          totalPrecision
        )}`
      ),
  })

  const calculatePercentageQuantityAndQuantityFromTotal = (value) => {
    const price = Number(values.price)
    const total = Number(value)

    const quantity = total / price

    const quantityWithPrecision =
      quantity === 0 ? '' : addPrecisionToNumber(quantity, quantityPrecision)

    const balance = selectedBaseSymbolBalance
    const pq = (total * 100) / balance
    const percentageQuantityWithPrecision =
      pq > 100 ? 100 : parseFloat(pq.toFixed(0))

    return { quantityWithPrecision, percentageQuantityWithPrecision }
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (values.price !== '' && values.price < selectedSymbolLastPrice) {
        notify({
          status: 'warning',
          title: 'Warning',
          message: 'You order will be executed immediately',
        })
      }
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [values.price])

  const handleChange = ({ target }) => {
    if (!allowOnlyNumberDecimalAndComma(target.value)) return
    const { name, value } = target

    if (target.name === 'price') {
      const maxLength = getMaxInputLength(target.value, pricePrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return

      const totalWithPrecision = addPrecisionToNumber(
        Number(value) * Number(values.quantity),
        totalPrecision
      )

      setValues((values) => ({
        ...values,
        price: value,
        total: totalWithPrecision,
      }))
      priceAndProfitSync(name, value)
    }

    if (name === 'quantity') {
      const maxLength = getMaxInputLength(target.value, quantityPrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return

      const total = addPrecisionToNumber(
        Number(value) * Number(values.price),
        totalPrecision
      )

      setValues((values) => ({
        ...values,
        quantity: value,
        total,
      }))

      priceAndProfitSync(name, value)
    }

    if (target.name === 'total') {
      const maxLength = getMaxInputLength(target.value, totalPrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return

      const { quantityWithPrecision, percentageQuantityWithPrecision } =
        calculatePercentageQuantityAndQuantityFromTotal(target.value)

      setValues((values) => ({
        ...values,
        quantity: quantityWithPrecision,
        quantityPercentage: percentageQuantityWithPrecision,
        [target.name]: target.value,
      }))

      validateInput({
        name: 'quantity',
        value: quantityWithPrecision,
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

  const handleSlider = (newValue) => {
    setValues((values) => ({
      ...values,
      quantityPercentage: newValue,
    }))
    priceAndProfitSync('quantityPercentage', newValue)
  }

  const priceAndProfitSync = (inputName, inputValue) => {
    if (inputName === 'quantity') {
      const pq =
        (inputValue * 100) /
        roundNumbers(selectedBaseSymbolBalance, quantityPrecision)
      const percentageQuantityWithPrecision =
        pq > 100 ? 100 : parseFloat(pq.toFixed(0))
      setValues((values) => ({
        ...values,
        quantityPercentage: percentageQuantityWithPrecision,
      }))
    }

    if (inputName === 'quantityPercentage') {
      const theQuantity =
        (roundNumbers(selectedBaseSymbolBalance, quantityPrecision) *
          inputValue) /
        100

      const derivedQuantity = addPrecisionToNumber(
        theQuantity,
        quantityPrecision
      )

      const total = addPrecisionToNumber(
        derivedQuantity * Number(values.price),
        totalPrecision
      )

      setValues((values) => ({
        ...values,
        quantity: derivedQuantity,
        total,
      }))

      validateInput({
        name: 'quantity',
        value: derivedQuantity,
      })

      if (values.price && values.quantity) {
        validateInput({
          name: 'total',
          value: total,
        })
      }
    }
  }

  const handleSliderInputChange = ({ target }) => {
    const maxLength = getMaxInputLength(target.value, amountPercentagePrecision)
    const inputLength = getInputLength(target.value)
    if (inputLength > maxLength) return

    const value = !target.value
      ? ''
      : removeTrailingZeroFromInput(Math.abs(target.value))

    const validatedValue = value > 100 ? 100 : value

    setValues((values) => ({
      ...values,
      quantityPercentage: validatedValue,
    }))
    priceAndProfitSync(target.name, validatedValue)
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
      const symbol = selectedSymbolDetail && selectedSymbolDetail['symbolpair']

      const payload = {
        price: convertCommaNumberToDot(values.price),
        quantity: convertCommaNumberToDot(values.quantity),
        balance: selectedBaseSymbolBalance,
        symbol,
        type: 'limit',
        total: values.total,
        side: 'sell',
      }
      dispatch(addEntry(payload))
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
      <div className="d-flex align-items-center justify-content-between">
        <div style={{ marginTop: '0.8rem', marginBottom: '0.8rem' }}>
          <FontAwesomeIcon icon={faWallet} />
          {'  '}
          {isLoadingBalance ? ' ' : selectedBaseSymbolBalance}
          {'  '}
          {selectedSymbolDetail && selectedSymbolDetail['base_asset']}
          {'  '}
        </div>
        {isLoadingBalance ? (
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
            style={{ marginRight: '10px', color: '#5A6677' }}
          ></span>
        ) : (
          <FontAwesomeIcon
            icon={faSync}
            onClick={() => refreshBalance()}
            style={{ cursor: 'pointer', marginRight: '10px' }}
            color="#5A6677"
            size="sm"
          />
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles['Input']}>
          <InlineInput
            label="Price"
            type="text"
            name="price"
            onChange={handleChange}
            onBlur={(e) => handleBlur(e, pricePrecision)}
            value={values.price}
            placeholder="Entry price"
            postLabel={isLoading ? '' : selectedSymbolDetail['quote_asset']}
          />
          {renderInputValidationError('price')}
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
              marks={sliderMarks}
              min={0}
              max={100}
              value={values.quantityPercentage}
              onChange={handleSlider}
              disabled={!values.price}
            />
          </div>

          <div className={styles['SliderInput']}>
            <InlineInput
              value={values.quantityPercentage}
              margin="dense"
              onChange={handleSliderInputChange}
              postLabel={'%'}
              disabled={!values.price}
              small
              name="quantityPercentage"
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
            postLabel={isLoading ? '' : selectedSymbolDetail['quote_asset']}
          />
          {renderInputValidationError('total')}
        </div>
        <Button type="submit" variant="exits">
          <span>
            Next: Exits
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
    </Fragment>
  )
}

export default SellFullLimitForm
