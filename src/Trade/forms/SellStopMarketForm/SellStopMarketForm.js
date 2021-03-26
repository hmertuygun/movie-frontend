import React, { Fragment, useState, useContext } from 'react'
import { InlineInput, Button } from '../../../components'
import PriceTriggerDropdown from '../../components/PriceTriggerDropdown/PriceTriggerDropdown'
import roundNumbers from '../../../helpers/roundNumbers'
import { useSymbolContext } from '../../context/SymbolContext'
import { UserContext } from '../../../contexts/UserContext'
import Slider from 'rc-slider'

import * as yup from 'yup'

import { faWallet, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { createBasicTrade } from '../../../api/api'
import {
  errorNotification,
  successNotification,
} from '../../../components/Notifications'

import {
  addPrecisionToNumber,
  addPrecisionToNumberForSell,
  removeTrailingZeroFromInput,
  getMaxInputLength,
  getInputLength,
  convertCommaNumberToDot,
  allowOnlyNumberDecimalAndComma,
} from '../../../helpers/tradeForm'

import styles from '../LimitForm/LimitForm.module.css'

const errorInitialValues = {
  price: '',
  quantity: '',
  total: '',
}

const SellStopMarketForm = () => {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedBaseSymbolBalance,
    isLoadingBalance,
    refreshBalance,
    selectedSymbolLastPrice,
  } = useSymbolContext()
  const { activeExchange } = useContext(UserContext)

  const [isBtnDisabled, setBtnVisibility] = useState(false)

  const pricePrecision =
    selectedSymbolDetail['tickSize'] > 8 ? '' : selectedSymbolDetail['tickSize']
  const totalPrecision =
    selectedSymbolDetail['symbolpair'] === 'ETHUSDT'
      ? 7
      : selectedSymbolDetail['quote_asset_precision']
  const quantityPrecision = selectedSymbolDetail['lotSize']
  const amountPercentagePrecision = 1

  const minPrice = Number(selectedSymbolDetail.minPrice)
  const maxPrice = Number(selectedSymbolDetail.maxPrice)
  const minQty = Number(selectedSymbolDetail.minQty)
  const minNotional = Number(selectedSymbolDetail.minNotional)

  const [values, setValues] = useState({
    price: addPrecisionToNumber(selectedSymbolLastPrice, pricePrecision),
    quantity: '',
    quantityPercentage: '',
    total: '',
    price_trigger: 'p',
  })

  const [errors, setErrors] = useState(errorInitialValues)

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
    price: yup
      .number()
      .required('Trigger Price is required')
      .typeError('Trigger Price is required')
      .min(
        minPrice,
        `Trigger price needs to meet min-price: ${addPrecisionToNumber(
          minPrice,
          pricePrecision
        )}`
      )
      .max(
        maxPrice,
        `Trigger Price needs to meet max-price: ${addPrecisionToNumber(
          maxPrice,
          pricePrecision
        )}`
      ),
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
    const price = Number(values.price)
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

      const derivedQuantity = addPrecisionToNumberForSell(
        theQuantity,
        quantityPrecision
      )

      const total = addPrecisionToNumberForSell(
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
      setErrors({ price: '', quantity: '', total: '' })
      try {
        if (isBtnDisabled) return
        setBtnVisibility(true)

        const symbol = selectedSymbolDetail['symbolpair']
        const { exchange, apiKeyName } = activeExchange

        const payload = {
          apiKeyName,
          exchange,
          order: {
            type: 'stop-market',
            side: 'SELL',
            symbol,
            trigger: convertCommaNumberToDot(values.price),
            quantity: convertCommaNumberToDot(values.quantity),
            price_trigger: values.price_trigger,
          },
        }
        const { data, status } = await createBasicTrade(payload)
        if (data?.status === 'error') {
          errorNotification.open({
            description:
              data?.error ||
              `Order couldn't be created. Please try again later!`,
          })
        } else {
          successNotification.open({ description: `Order Created!` })
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
          {isLoadingBalance ? ' ' : selectedBaseSymbolBalance}
          {'  '}
          {selectedSymbolDetail['base_asset']}
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
      <section>
        <form onSubmit={handleSubmit}>
          <div className={styles['Input']}>
            <div className={styles['InputDropdownContainer']}>
              <PriceTriggerDropdown
                onSelect={(selected) =>
                  setValues({ ...values, price_trigger: selected.value })
                }
              />
              <InlineInput
                label="Trigger Price"
                type="text"
                placeholder="Trigger price"
                value={values.price}
                name="price"
                onChange={handleChange}
                onBlur={(e) => handleBlur(e, pricePrecision)}
                postLabel={selectedSymbolDetail['quote_asset']}
              />
            </div>
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
            <span>Sell {selectedSymbolDetail['base_asset']}</span>
          </Button>
        </form>
      </section>
    </Fragment>
  )
}

export default SellStopMarketForm
