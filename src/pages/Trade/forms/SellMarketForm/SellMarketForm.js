import React, { Fragment, useState, useEffect } from 'react'
import { InlineInput, Button } from 'components'
import roundNumbers from 'utils/roundNumbers'
import { useSymbolContext } from 'contexts/SymbolContext'
import Slider from 'rc-slider'
import { notify } from 'reapop'

import * as yup from 'yup'

import { faWallet, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { createBasicTrade, sendOrderInfo } from 'services/api'

import {
  addPrecisionToNumber,
  removeTrailingZeroFromInput,
  getMaxInputLength,
  getInputLength,
  convertCommaNumberToDot,
  allowOnlyNumberDecimalAndComma,
} from 'utils/tradeForm'
import { updateShow2FAModal } from 'store/actions'

// eslint-disable-next-line css-modules/no-unused-class
import styles from '../LimitForm/LimitForm.module.css'
import { trackEvent } from 'services/tracking'
import { analytics } from 'services/firebase'
import { useDispatch, useSelector } from 'react-redux'
import MESSAGES from 'constants/Messages'

const errorInitialValues = {
  quantity: '',
  total: '',
}

const SellMarketForm = () => {
  const { isLoading, refreshBalance } = useSymbolContext()
  const {
    selectedSymbolDetail,
    selectedBaseSymbolBalance,
    isLoadingBalance,
    selectedSymbolLastPrice,
    isLoadingLastPrice,
  } = useSelector((state) => state.symbols)
  const { activeExchange } = useSelector((state) => state.exchanges)
  const { need2FA } = useSelector((state) => state.apiKeys)
  const [isBtnDisabled, setBtnVisibility] = useState(false)
  const dispatch = useDispatch()

  const tickSize = selectedSymbolDetail && selectedSymbolDetail['tickSize']
  const pricePrecision = tickSize > 8 ? '' : tickSize
  const symbolPair = selectedSymbolDetail && selectedSymbolDetail['symbolpair']
  const quoteAssetPrecision =
    selectedSymbolDetail && selectedSymbolDetail['quote_asset_precision']
  const totalPrecision = symbolPair === 'ETHUSDT' ? 7 : quoteAssetPrecision
  const quantityPrecision =
    selectedSymbolDetail && selectedSymbolDetail['lotSize']
  const amountPercentagePrecision = 1

  const minQty = selectedSymbolDetail && Number(selectedSymbolDetail.minQty)
  const minNotional =
    selectedSymbolDetail && Number(selectedSymbolDetail.minNotional)

  const [values, setValues] = useState({
    quantity: '',
    quantityPercentage: '',
    total: '',
  })

  const [errors, setErrors] = useState(errorInitialValues)

  const marks = {
    0: '',
    25: '',
    50: '',
    75: '',
    100: '',
  }

  useEffect(() => {
    setValues({
      quantity: '',
      quantityPercentage: '',
      total: '',
    })
  }, [selectedSymbolDetail])

  // @TODO
  // Move schema to a different folder
  const formSchema = yup.object().shape({
    quantity: yup
      .number()
      .required('Amount is required')
      .typeError('Amount is required')
      .min(
        minQty,
        `Amount needs to meet min-amount: ${addPrecisionToNumber(
          minQty,
          quantityPrecision
        )}`
      )
      .max(selectedBaseSymbolBalance, `Amount cannot not exceed your balance.`),
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
    const price = Number(selectedSymbolLastPrice)
    const total = Number(value)

    const quantity = total / price

    const quantityWithPrecision =
      quantity === 0 ? '' : addPrecisionToNumber(quantity, quantityPrecision)

    const balance = selectedBaseSymbolBalance
    const pq = (quantity * 100) / balance

    const percentageQuantityWithPrecision =
      pq > 100 ? 100 : parseFloat(pq.toFixed(0))

    return { quantityWithPrecision, percentageQuantityWithPrecision }
  }

  const handleBlur = ({ target }, precision) => {
    validateInput(target)
    setValues((values) => ({
      ...values,
      [target.name]: addPrecisionToNumber(target.value, precision),
    }))
  }

  const handleQPSliderChange = (newValue) => {
    setValues((values) => ({
      ...values,
      quantityPercentage: newValue,
    }))
    priceAndProfitSync('quantityPercentage', newValue)
  }

  const handleQPInputChange = ({ target }) => {
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

    const { name, value } = target

    if (name === 'price') {
      const maxLength = getMaxInputLength(target.value, pricePrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return

      const total = addPrecisionToNumber(
        Number(value) * Number(values.quantity),
        totalPrecision
      )

      setValues((values) => ({
        ...values,
        [name]: value,
        total,
      }))

      priceAndProfitSync(name, value)
    }

    if (name === 'quantity') {
      const maxLength = getMaxInputLength(target.value, quantityPrecision)
      const inputLength = getInputLength(target.value)
      if (inputLength > maxLength) return

      const total = addPrecisionToNumber(
        Number(value) * Number(selectedSymbolLastPrice),
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
        derivedQuantity * Number(selectedSymbolLastPrice),
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

      if (values.quantity) {
        validateInput({
          name: 'total',
          value: total,
        })
      }
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isFormValid = await validateForm()

    if (isFormValid) {
      setErrors({ quantity: '', total: '' })
      if (!need2FA) {
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
              type: 'market',
              side: 'SELL',
              symbol,
              quantity: convertCommaNumberToDot(values.quantity),
              total: values.total,
            },
          }
          const res = await createBasicTrade(payload)
          if (res?.status === 'error' || res.status !== 200) {
            dispatch(
              notify(
                res.data?.detail || MESSAGES['order-create-failed'],
                'error'
              )
            )
          } else {
            let data = {
              orders: payload,
              status_code: res.status,
            }
            sendOrderInfo(data)
            dispatch(notify(MESSAGES['order-created'], 'success'))
            analytics.logEvent('placed_sell_market_order')
            trackEvent(
              'user',
              'placed_sell_market_order',
              'placed_sell_market_order'
            )
            refreshBalance()
          }
          setValues({
            ...values,
            quantity: '',
            total: '',
            quantityPercentage: '',
          })
        } catch (error) {
          dispatch(notify(MESSAGES['order-create-error'], 'error'))
        } finally {
          setBtnVisibility(false)
        }
      } else {
        dispatch(updateShow2FAModal(true))
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
            type="number"
            name="price"
            placeholder="Market"
            disabled
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
              marks={marks}
              min={0}
              max={100}
              onChange={handleQPSliderChange}
              value={values.quantityPercentage}
              disabled={isLoadingLastPrice}
            />
          </div>
          <div className={styles['SliderInput']}>
            <InlineInput
              value={values.quantityPercentage}
              margin="dense"
              name="quantityPercentage"
              onChange={handleQPInputChange}
              postLabel={'%'}
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
        <Button type="submit" variant="sell" disabled={isBtnDisabled}>
          <span>
            Sell {selectedSymbolDetail && selectedSymbolDetail['base_asset']}
          </span>
        </Button>
      </form>
    </Fragment>
  )
}

export default SellMarketForm
