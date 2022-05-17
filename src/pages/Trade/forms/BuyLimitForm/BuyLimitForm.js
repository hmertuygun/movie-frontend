import React, { Fragment, useState, useContext, useEffect } from 'react'
import Slider from 'rc-slider'
import { useNotifications } from 'reapop'
import { faWallet, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as yup from 'yup'

import { createBasicTrade } from 'services/api'
import OrderWarningModal from '../../components/OrderWarningModal'
import {
  addPrecisionToNumber,
  removeTrailingZeroFromInput,
  getMaxInputLength,
  getInputLength,
  convertCommaNumberToDot,
  allowOnlyNumberDecimalAndComma,
} from 'utils/tradeForm'
import { trackEvent } from 'services/tracking'
import { analytics } from 'services/firebase'
import { useSymbolContext } from 'contexts/SymbolContext'
import { UserContext } from 'contexts/UserContext'
import { InlineInput, Button } from 'components'
// eslint-disable-next-line css-modules/no-unused-class
import styles from '../LimitForm/LimitForm.module.css'

const BuyLimitForm = () => {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolBalance,
    isLoadingBalance,
    refreshBalance,
    selectedSymbolLastPrice,
  } = useSymbolContext()
  const { activeExchange } = useContext(UserContext)
  const { notify } = useNotifications()

  const [isBtnDisabled, setBtnVisibility] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const minNotional =
    selectedSymbolDetail && Number(selectedSymbolDetail.minNotional)
  const maxPrice = selectedSymbolDetail && Number(selectedSymbolDetail.maxPrice)
  const minPrice = selectedSymbolDetail && Number(selectedSymbolDetail.minPrice)
  const maxQty = selectedSymbolDetail && Number(selectedSymbolDetail.maxQty)
  const minQty = selectedSymbolDetail && Number(selectedSymbolDetail.minQty)

  const amountPercentagePrecision = 1
  const ticketSize = selectedSymbolDetail && selectedSymbolDetail['tickSize']
  const pricePrecision = ticketSize > 8 ? '' : ticketSize

  const quantityPrecision =
    selectedSymbolDetail && selectedSymbolDetail['lotSize']
  const symbolPairAvailable =
    selectedSymbolDetail && selectedSymbolDetail['symbolpair']
  const quoteAssetPrecision =
    selectedSymbolDetail && selectedSymbolDetail['quote_asset_precision']
  const totalPrecision =
    symbolPairAvailable === 'ETHUSDT' ? 7 : quoteAssetPrecision

  const sliderMarks = {
    0: '',
    25: '',
    50: '',
    75: '',
    100: '',
  }

  const [values, setValues] = useState({
    price: addPrecisionToNumber(selectedSymbolLastPrice, pricePrecision),
    quantity: '',
    total: '',
    quantityPercentage: '',
  })

  const [errors, setErrors] = useState({
    price: '',
    quantity: '',
    total: '',
  })

  useEffect(() => {
    if (typeof selectedSymbolDetail?.tickSize == 'number') {
      setValues((prevVal) => ({
        quantity: '',
        total: '',
        quantityPercentage: '',
        price: addPrecisionToNumber(
          selectedSymbolLastPrice,
          selectedSymbolDetail['tickSize'] > 8
            ? ''
            : selectedSymbolDetail['tickSize']
        ),
      }))
    }
  }, [selectedSymbolLastPrice, selectedSymbolDetail])
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
    if (!allowOnlyNumberDecimalAndComma(target?.value)) return

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
    } else if (target.name === 'price') {
      const maxLength = getMaxInputLength(target.value, pricePrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return

      const { totalWithPrecision } = calculateTotalAndPercentageQuantity(
        target.value,
        'quantity'
      )

      setValues((values) => ({
        ...values,
        [target.name]: target.value,
        total: totalWithPrecision,
      }))

      if (values.price && values.quantity) {
        validateInput({
          name: 'total',
          value: totalWithPrecision,
        })
      }
    } else {
      const maxLength = getMaxInputLength(target.value, quantityPrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return
      const { totalWithPrecision, percentageQuantityWithPrecision } =
        calculateTotalAndPercentageQuantity(target.value, 'price')

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
    const cost = sliderPercentage * balance

    const costPrecise = addPrecisionToNumber(cost, totalPrecision)

    const quantity = costPrecise / parseFloat(values.price)
    const quantityWithPrecision = quantity.toString().includes('e')
      ? ''
      : addPrecisionToNumber(quantity, quantityPrecision)

    const totalWithPrecision = addPrecisionToNumber(
      Number(values.price * quantityWithPrecision),
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

  const placeOrder = async () => {
    try {
      if (isBtnDisabled) return
      setBtnVisibility(true)

      const symbol = selectedSymbolDetail['symbolpair']
      const { exchange, apiKeyName } = activeExchange

      const payload = {
        apiKeyName,
        exchange,
        order: {
          type: 'limit',
          side: 'BUY',
          symbol,
          quantity: convertCommaNumberToDot(values.quantity),
          price: convertCommaNumberToDot(values.price),
          total: values.total,
        },
      }
      const { data } = await createBasicTrade(payload)
      if (data?.status === 'error') {
        notify({
          status: 'error',
          title: 'Error',
          message:
            data?.error || `Order couldn't be created. Please try again later!`,
        })
      } else {
        notify({
          status: 'success',
          title: 'Success',
          message: 'Order Created!',
        })
        analytics.logEvent('placed_buy_limit_order')
        trackEvent('user', 'placed_buy_limit_order', 'placed_buy_limit_order')
        refreshBalance()
      }
      setValues({
        ...values,
        quantity: '',
        total: '',
        quantityPercentage: '',
      })
    } catch (error) {
      notify({
        status: 'error',
        title: 'Error',
        message: (
          <p>
            Order couldn’t be created. Unknown error. Please report at:{' '}
            <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://support.coinpanel.com"
            >
              <b>support.coinpanel.com</b>
            </a>
          </p>
        ),
      })
    } finally {
      setBtnVisibility(false)
      setShowWarning(false)
    }
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault()

    const isFormValid = await validateForm()

    if (isFormValid) {
      setErrors({ price: '', quantity: '', total: '' })
      const percent =
        ((values.price - selectedSymbolLastPrice) / selectedSymbolLastPrice) *
        100
      if (percent !== 0 && percent > 0.5) {
        setShowWarning(true)
        return
      }
      placeOrder()
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
      {showWarning ? (
        <OrderWarningModal
          isLoading={isBtnDisabled}
          onClose={() => setShowWarning(false)}
          placeOrder={() => placeOrder()}
        />
      ) : null}
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
            onClick={refreshBalance}
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
            placeholder="Price"
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
        <Button type="submit" variant="buy" disabled={isBtnDisabled}>
          <span>
            Buy {selectedSymbolDetail && selectedSymbolDetail['base_asset']}
          </span>
        </Button>
      </form>
    </Fragment>
  )
}

export default BuyLimitForm