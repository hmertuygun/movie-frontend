import React, { Fragment, useState, useEffect } from 'react'
import Slider from 'rc-slider'
import { notify } from 'reapop'

import { createBasicTrade, sendOrderInfo } from 'services/api'

import {
  addPrecisionToNumber,
  removeTrailingZeroFromInput,
  getMaxInputLength,
  getInputLength,
  allowOnlyNumberDecimalAndComma,
} from 'utilis/tradeForm'

import { faWallet, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useSymbolContext } from 'contexts/SymbolContext'

import { InlineInput, Button } from 'components'

import * as yup from 'yup'

import styles from '../LimitForm/LimitForm.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { consoleLogger } from 'utils/logger'
import MESSAGES from 'constants/Messages'

const SellTrailingStopForm = () => {
  const { isLoading, refreshBalance } = useSymbolContext()
  const {
    selectedSymbolDetail,
    selectedSymbolBalance,
    isLoadingBalance,
    selectedSymbolLastPrice,
  } = useSelector((state) => state.symbols)
  const { activeExchange } = useSelector((state) => state.exchanges)
  const dispatch = useDispatch()
  const [isBtnDisabled, setBtnVisibility] = useState(false)

  const minNotional =
    selectedSymbolDetail && Number(selectedSymbolDetail.minNotional)
  const minPrice = selectedSymbolDetail && Number(selectedSymbolDetail.minPrice)
  const maxQty = selectedSymbolDetail && Number(selectedSymbolDetail.maxQty)
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

  const [values, setValues] = useState({
    callback_rate: '',
    activation_price: '',
    price_trigger: { value: 'p', label: 'Last' },
    quantity: '',
    total: '',
    quantityPercentage: '',
  })

  const [errors, setErrors] = useState({
    callback_rate: '',
    activation_price: '',
    quantity: '',
    total: '',
  })

  useEffect(() => {
    setValues({
      callback_rate: '',
      activation_price: '',
      price_trigger: { value: 'p', label: 'Last' },
      quantity: '',
      total: '',
      quantityPercentage: '',
    })
  }, [selectedSymbolDetail])

  // @TODO
  // Move schema to a different folder
  const formSchema = yup.object().shape(
    {
      callback_rate: yup
        .number()
        .required('Callback Rate is required')
        .typeError('Callback Rate is required')
        .positive()
        .min(0.1, 'Callback Rate needs to meet min-rate: 0.1')
        .max(5, 'Callback Rate needs to meet max-rate: 5'),
      activation_price:
        values.activation_price === ''
          ? yup.string().notRequired()
          : yup
              .number()
              .typeError('Activation Price must be a number')
              .positive()
              .min(
                minPrice,
                `Activation Price needs to meet min-price: ${addPrecisionToNumber(
                  minPrice,
                  pricePrecision
                )}`
              )
              .max(
                selectedSymbolLastPrice,
                `Activation Price needs to meet max-price: ${addPrecisionToNumber(
                  selectedSymbolLastPrice,
                  pricePrecision
                )}`
              ),
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
    },
    [values.activation_price]
  )

  const calculatePercentageQuantityAndQuantityFromTotal = (value) => {
    const price = selectedSymbolLastPrice
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
    const total = Number(value) * selectedSymbolLastPrice
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
    if (!allowOnlyNumberDecimalAndComma(target.value)) return

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
    } else if (target.name === 'quantity') {
      const maxLength = getMaxInputLength(target.value, quantityPrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return

      const { totalWithPrecision, percentageQuantityWithPrecision } =
        calculateTotalAndPercentageQuantity(target.value)

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
    if (target.name === 'activation_price') {
      const maxLength = getMaxInputLength(target.value, pricePrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return

      setValues((values) => ({
        ...values,
        [target.name]: target.value,
      }))
      if (target.value === '') {
        setErrors({
          ...errors,
          activation_price: '',
        })
        return
      }
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
    const cost = sliderPercentage * balance

    const costPrecise = addPrecisionToNumber(cost, totalPrecision)

    const quantity = costPrecise / parseFloat(selectedSymbolLastPrice)
    const quantityWithPrecision = quantity.toString().includes('e')
      ? ''
      : addPrecisionToNumber(quantity, quantityPrecision)

    const totalWithPrecision = addPrecisionToNumber(
      selectedSymbolLastPrice * quantityWithPrecision,
      totalPrecision
    )

    return { totalWithPrecision, quantityWithPrecision }
  }

  const handleSlider = (newValue) => {
    const { quantityWithPrecision, totalWithPrecision } =
      calculateTotalAndQuantityFromSliderPercentage(newValue)

    setValues((values) => ({
      ...values,
      quantityPercentage: parseInt(newValue) || 0,
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
    if (!allowOnlyNumberDecimalAndComma(target.value)) return

    const maxLength = getMaxInputLength(target.value, amountPercentagePrecision)
    const inputLength = getInputLength(target.value)
    if (inputLength > maxLength) return

    const value = removeTrailingZeroFromInput(Math.abs(target.value))
    const validatedValue = value > 100 ? 100 : value

    const { quantityWithPrecision, totalWithPrecision } =
      calculateTotalAndQuantityFromSliderPercentage(validatedValue)

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
      try {
        if (isBtnDisabled) return
        setBtnVisibility(true)

        const symbol =
          selectedSymbolDetail && selectedSymbolDetail['symbolpair']
        const { exchange, apiKeyName } = activeExchange

        const payload = {
          apiKeyName,
          exchange,
          order: {
            type: 'trailing-stop',
            side: 'BUY',
            symbol,
            callback_rate: values.callback_rate,
            activation_price: values.activation_price,
            quantity: values.quantity,
            price_trigger: values.price_trigger.value,
          },
        }
        const res = await createBasicTrade(payload)
        if (res?.status === 'error' || res.status !== 200) {
          dispatch(
            notify(res.data?.detail || MESSAGES['order-create-failed'], 'error')
          )
        } else {
          let data = {
            orders: payload,
            status_code: res.status,
          }
          sendOrderInfo(data)
          dispatch(notify(MESSAGES['order-created'], 'success'))
          refreshBalance()
        }
        setValues({
          ...values,
          quantity: '',
          total: '',
          quantityPercentage: '',
        })
      } catch (error) {
        consoleLogger(error)
        dispatch(notify(MESSAGES['order-create-error'], 'error'))
      } finally {
        setBtnVisibility(false)
      }
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
          {isLoadingBalance ? ' ' : selectedSymbolBalance}
          {'  '}
          {selectedSymbolDetail && selectedSymbolDetail['quote_asset']}
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
          <div className={styles['CallbackRateInput']}>
            <InlineInput
              label="Callback Rate"
              type="text"
              name="callback_rate"
              onChange={handleChange}
              onBlur={(e) => handleBlur(e, 1)}
              value={values.callback_rate}
              placeholder=""
              postLabel={'%'}
            />
            <button
              className={styles['CallbackRateBtn']}
              type="button"
              onClick={() => {
                setValues({ ...values, callback_rate: '1' })
                validateInput({ name: 'callback_rate', value: 1 })
              }}
            >
              1 <span>%</span>
            </button>
            <button
              className={styles['CallbackRateBtn']}
              type="button"
              onClick={() => {
                setValues({ ...values, callback_rate: '2' })
                validateInput({ name: 'callback_rate', value: 2 })
              }}
            >
              2 <span>%</span>
            </button>
          </div>
          {renderInputValidationError('callback_rate')}
        </div>

        <div className={styles['Input']}>
          <InlineInput
            label="Activation Price"
            type="text"
            name="activation_price"
            onChange={handleChange}
            onBlur={(e) => handleBlur(e, pricePrecision)}
            value={values.activation_price}
            placeholder=""
            postLabel={isLoading ? '' : selectedSymbolDetail['quote_asset']}
          />
          {renderInputValidationError('activation_price')}
        </div>
        <div className={styles['Input']}>
          <InlineInput
            label="Order Qty"
            type="text"
            name="quantity"
            onChange={handleChange}
            onBlur={(e) => handleBlur(e, quantityPrecision)}
            value={values.quantity}
            placeholder=""
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
              disabled={values.activation_price > selectedSymbolLastPrice}
            />
          </div>

          <div className={styles['SliderInput']}>
            <InlineInput
              value={values.quantityPercentage}
              margin="dense"
              onChange={handleSliderInputChange}
              postLabel={'%'}
              disabled={values.activation_price > selectedSymbolLastPrice}
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

        <Button type="submit" variant="buy" disabled={isBtnDisabled}>
          <span>
            Buy {selectedSymbolDetail && selectedSymbolDetail['base_asset']}
          </span>
        </Button>
      </form>
    </Fragment>
  )
}

export default SellTrailingStopForm
