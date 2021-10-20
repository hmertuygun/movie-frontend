import React, { useState, useEffect, useMemo, useContext } from 'react'
import * as yup from 'yup'

import { useSymbolContext } from '../../../context/SymbolContext'
import { UserContext } from '../../../../contexts/UserContext'
import { InlineInput } from '../../../../components'
import {
  getMaxInputLength,
  getInputLength,
  addPrecisionToNumber,
  allowOnlyNumberDecimalAndComma,
} from '../../../../helpers/tradeForm'
// eslint-disable-next-line css-modules/no-unused-class
import styles from '../../../forms/LimitForm/LimitForm.module.css'
import { findIndex } from 'lodash'

const OrderEditModal = ({
  onClose,
  onSave,
  isLoading,
  selectedOrder,
  isFullTrade,
  entryOrder,
  stoplossOrder,
  targetOrders,
}) => {
  const { activeExchange } = useContext(UserContext)

  const [values, setValues] = useState({
    triggerPrice: '',
    price: '',
  })
  const [errors, setErrors] = useState({
    triggerPrice: '',
    price: '',
  })

  const [pricePrecision, setPricePrecision] = useState(0)
  const [showPrice, setShowPrice] = useState(false)
  const [showTriggerPrice, setShowTriggerPrice] = useState(true)
  const [selectedSymbolDetail, setselectedSymbolDetail] = useState(null)
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)
  const isEntry = isFullTrade
    ? selectedOrder.order_id === entryOrder.order_id
    : false
  const isStoploss = isFullTrade
    ? selectedOrder.order_id === stoplossOrder.order_id
    : false
  const entryPrice =
    entryOrder?.type === 'STOP-MARKET' ? entryOrder?.trigger : entryOrder?.price

  const { symbolDetails } = useSymbolContext()

  const activeIndex = findIndex(targetOrders, {
    order_id: selectedOrder.order_id,
  })

  const nextTriggerPrice = useMemo(() => {
    const nextTarget =
      activeIndex === targetOrders?.length - 1
        ? null
        : targetOrders?.[activeIndex + 1]

    if (!nextTarget) return null
    const { trigger: triggerCondition } = nextTarget

    let trigger = ''
    if (triggerCondition.split(' ').length > 1) {
      trigger = triggerCondition.split(' ')[1]
    } else {
      trigger = triggerCondition
    }
    return trigger
  }, [targetOrders, activeIndex])

  const prevTriggerPrice = useMemo(() => {
    const prevTarget =
      activeIndex === 0 ? null : targetOrders?.[activeIndex - 1]

    if (!prevTarget) return null
    const { trigger: triggerCondition } = prevTarget

    let trigger = ''
    if (triggerCondition.split(' ').length > 1) {
      trigger = triggerCondition.split(' ')[1]
    } else {
      trigger = triggerCondition
    }
    return trigger
  }, [targetOrders, activeIndex])

  const formSchema = yup.object().shape(
    {
      triggerPrice: showTriggerPrice
        ? yup
            .number()
            .required('Trigger price is required')
            .typeError('Trigger price is required')
            .min(
              minPrice,
              `Trigger price needs to meet min-price: ${addPrecisionToNumber(
                minPrice,
                pricePrecision
              )}`
            )
            .test(
              'Trigger Price',
              `Trigger Price must be higher than Entry Price: ${addPrecisionToNumber(
                entryPrice,
                pricePrecision
              )}`,
              (value) =>
                isFullTrade && !isStoploss && !isEntry
                  ? value > entryPrice
                  : true
            )
            .test(
              'Trigger Price',
              `Trigger Price must be higher than the Target ${activeIndex} Price: ${addPrecisionToNumber(
                prevTriggerPrice,
                pricePrecision
              )}`,
              (value) =>
                prevTriggerPrice
                  ? isFullTrade && !isStoploss && !isEntry
                    ? value > prevTriggerPrice
                    : true
                  : true
            )
            .test(
              'Trigger Price',
              `Trigger Price must be lower than the Target ${
                activeIndex + 2
              } Price: ${addPrecisionToNumber(
                nextTriggerPrice,
                pricePrecision
              )}`,
              (value) =>
                nextTriggerPrice
                  ? isFullTrade && !isStoploss && !isEntry
                    ? value < nextTriggerPrice
                    : true
                  : true
            )
            .max(
              maxPrice,
              `Trigger price needs to meet max-price: ${addPrecisionToNumber(
                maxPrice,
                pricePrecision
              )}`
            )
        : null,
      price: showPrice
        ? minPrice
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
              .typeError('Price is required')
        : null,
    },
    [
      minPrice,
      maxPrice,
      pricePrecision,
      showPrice,
      showTriggerPrice,
      prevTriggerPrice,
      nextTriggerPrice,
      activeIndex,
      isFullTrade,
      isEntry,
      isStoploss,
      entryPrice,
    ]
  )

  useEffect(() => {
    if (!selectedOrder || !symbolDetails || !activeExchange.exchange) return
    const { orderSymbol, trigger: triggerCondition, price } = selectedOrder
    const modifiedSymbol = orderSymbol.split('-').join('/')
    const selectedSymbolDetail =
      symbolDetails[
        `${activeExchange.exchange.toUpperCase()}:${modifiedSymbol}`
      ]
    setselectedSymbolDetail(selectedSymbolDetail)

    if (!selectedSymbolDetail) return
    const { minPrice, maxPrice } = selectedSymbolDetail
    const pricePrecision =
      selectedSymbolDetail['tickSize'] > 8
        ? ''
        : selectedSymbolDetail['tickSize']
    setPricePrecision(pricePrecision)
    setMinPrice(minPrice)
    setMaxPrice(maxPrice)
    // setPricePrecision(precision)

    // Handle Price
    if (price !== 'Market') {
      setShowPrice(true)
    }
    const priceValue =
      price === 'Market' ? '' : addPrecisionToNumber(price, pricePrecision)
    setValues({
      price: priceValue,
    })

    // Handle Trigger Price
    if (!triggerCondition) {
      setShowTriggerPrice(false)
      return
    }

    let trigger = ''
    if (triggerCondition.split(' ').length > 1) {
      trigger = triggerCondition.split(' ')[1]
    } else {
      trigger = triggerCondition
    }

    const triggerValue = addPrecisionToNumber(trigger, pricePrecision)
    setValues({
      price: priceValue,
      triggerPrice: triggerValue,
    })
  }, [activeExchange.exchange, selectedOrder, symbolDetails])

  const handleBlur = ({ target }, precision) => {
    setValues((values) => ({
      ...values,
      [target.name]: addPrecisionToNumber(target.value, precision),
    }))
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
    const maxLength = getMaxInputLength(target.value, pricePrecision)
    const inputLength = getInputLength(target.value)
    if (inputLength > maxLength) return
    setValues((values) => ({
      ...values,
      [target.name]: target.value,
    }))
    validateInput(target)
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    const isFormValid = await validateForm()
    if (!isFormValid) return
    onSave(values)
  }

  const renderInputValidationError = (errorKey) => (
    <>
      {errors[errorKey] && (
        <div className={styles['Error']}>{errors[errorKey]}</div>
      )}
    </>
  )

  return (
    <div className="modal-open">
      <div
        className="modal fade show"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-modal="true"
        style={{ display: 'block' }}
      >
        <form
          className="modal-dialog modal-dialog-centered modal-sm"
          onSubmit={handleSubmit}
        >
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">Edit Order</div>
              <button
                onClick={onClose}
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span className="modal-cross" aria-hidden="true">
                  &times;
                </span>
              </button>
            </div>
            <div className="modal-body">
              {showPrice ? (
                <div className={styles['Input']}>
                  <InlineInput
                    label="Price"
                    type="text"
                    name="price"
                    onBlur={(e) => handleBlur(e, pricePrecision)}
                    value={values.price}
                    onChange={handleChange}
                    placeholder="Price"
                    postLabel={
                      !selectedSymbolDetail
                        ? ''
                        : selectedSymbolDetail['quote_asset']
                    }
                    autoFocus
                  />
                  {renderInputValidationError('price')}
                </div>
              ) : null}
              {showTriggerPrice ? (
                <div className={styles['Input']}>
                  <InlineInput
                    label="Trigger Price"
                    type="text"
                    name="triggerPrice"
                    onChange={handleChange}
                    onBlur={(e) => handleBlur(e, pricePrecision)}
                    value={values.triggerPrice}
                    placeholder="Trigger Price"
                    postLabel={
                      !selectedSymbolDetail
                        ? ''
                        : selectedSymbolDetail['quote_asset']
                    }
                    autoFocus
                  />
                  {renderInputValidationError('triggerPrice')}
                </div>
              ) : null}
            </div>
            <div className="modal-footer">
              <button
                disabled={isLoading}
                type="submit"
                className="btn btn-primary"
              >
                {!isLoading ? (
                  'Submit'
                ) : (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  )
}

export default OrderEditModal
