import React, { Fragment, useState, useContext, useEffect } from 'react'
import Slider from 'rc-slider'

import { createBasicTrade } from '../../../api/api'
import {
  errorNotification,
  successNotification,
} from '../../../components/Notifications'

import {
  addPrecisionToNumber,
  removeTrailingZeroFromInput,
  getMaxInputLength,
  getInputLength,
  allowOnlyNumberDecimalAndComma,
} from '../../../helpers/tradeForm'

import { faWallet, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useSymbolContext } from '../../context/SymbolContext'
import { UserContext } from '../../../contexts/UserContext'

import { InlineInput, Button } from '../../../components'

import * as yup from 'yup'

// eslint-disable-next-line css-modules/no-unused-class
import styles from '../LimitForm/LimitForm.module.css'
import { Event } from '../../../Tracking'
import { analytics } from '../../../firebase/firebase'

const BuyMarketForm = () => {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolBalance,
    isLoadingBalance,
    isLoadingLastPrice,
    selectedSymbolLastPrice,
    refreshBalance,
  } = useSymbolContext()
  const { activeExchange } = useContext(UserContext)

  const [values, setValues] = useState({
    quantity: '',
    total: '',
    quantityPercentage: '',
  })

  const [errors, setErrors] = useState({
    quantity: '',
    total: '',
  })

  const [isBtnDisabled, setBtnVisibility] = useState(false)

  const minNotional =
    selectedSymbolDetail && Number(selectedSymbolDetail.minNotional)
  const maxQty = selectedSymbolDetail && Number(selectedSymbolDetail.maxQty)
  const minQty = selectedSymbolDetail && Number(selectedSymbolDetail.minQty)

  const quantityPrecision =
    selectedSymbolDetail && selectedSymbolDetail['lotSize']
  const amountPercentagePrecision = 1
  const symbolpair = selectedSymbolDetail && selectedSymbolDetail['symbolpair']
  const quoteAssetPrecision =
    selectedSymbolDetail && selectedSymbolDetail['quote_asset_precision']
  const totalPrecision = symbolpair === 'ETHUSDT' ? 7 : quoteAssetPrecision

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
      total: '',
      quantityPercentage: '',
    })
  }, [selectedSymbolLastPrice, selectedSymbolDetail])

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

  const calculateTotalAndPercentageQuantity = (value) => {
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
    setErrors((errors) => ({
      ...errors,
      [target.name]: '',
    }))

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
    const { quantityWithPrecision, totalWithPrecision } =
      calculateTotalAndQuantityFromSliderPercentage(newValue)

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
            type: 'market',
            side: 'BUY',
            symbol,
            quantity: values.quantity,
            total: values.total,
          },
        }
        const { data } = await createBasicTrade(payload)
        if (data?.status === 'error') {
          errorNotification.open({
            description:
              data?.error ||
              `Order couldn't be created. Please try again later!`,
          })
        } else {
          successNotification.open({ description: `Order Created!` })
          analytics.logEvent('placed_buy_market_order')
          Event('user', 'placed_buy_market_order', 'placed_buy_market_order')
          refreshBalance()
        }
        setValues({
          ...values,
          quantity: '',
          total: '',
          quantityPercentage: '',
        })
      } catch (error) {
        errorNotification.open({
          description: (
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
              disabled={isLoadingLastPrice}
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
        <Button type="submit" variant="buy" disabled={isBtnDisabled}>
          <span>
            Buy {selectedSymbolDetail && selectedSymbolDetail['base_asset']}
          </span>
        </Button>
      </form>
    </Fragment>
  )
}

export default BuyMarketForm
