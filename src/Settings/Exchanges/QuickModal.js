import React, { useState, useEffect, useContext, useMemo } from 'react'
import { Key } from 'react-feather'
import Select from 'react-select'
import * as yup from 'yup'
import { UserContext } from '../../contexts/UserContext'
import { options, validationRules } from '../../constants/ExchangeOptions'
import { supportLinks } from '../../constants/SupportLinks'
import {
  errorInitialValues,
  customStyles,
  defaultExchange,
} from '../../constants/QuickModal'

const QuickModal = ({ onClose, onSave, isLoading, isVisible }) => {
  const { isPaidUser, isException } = useContext(UserContext)
  const [exchange, setExchange] = useState(defaultExchange)
  const [apiName, setApiName] = useState('')
  const [validation, setValidation] = useState({})
  const [exchangeForm, setExchangeForm] = useState()
  const [formFields, setFormFields] = useState()

  const [errors, setErrors] = useState({
    ...errorInitialValues,
    ...exchangeForm,
  })

  const exchangeOptions = useMemo(() => {
    return options.map((element) => {
      if (element.value === 'bybit' && !isPaidUser && !isException) {
        return { ...element, isDisabled: true }
      }
      return element
    })
  }, [isPaidUser, isException])

  const setExchangeFormFields = () => {
    let exchangeFields = {}
    let validationFields = {
      exchange: validationRules.exchange,
      apiName: validationRules.apiName,
    }

    const { fields } = options.find(
      (exchangeItem) => exchange.value === exchangeItem.value
    )

    Object.values(fields).forEach((value) => {
      exchangeFields[value] = ''
      validationFields[value] = validationRules[value]
    })
    setExchangeForm(exchangeFields)
    setErrors({ ...errorInitialValues, ...exchangeFields })
    setValidation(validationFields)
    setFormFields(fields)
  }

  useEffect(() => {
    setExchangeFormFields()
  }, [exchange])

  const validateInput = (target) => {
    const isValid = yup
      .object()
      .shape(validation)
      .fields[target.name].validate(target.value)
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

  const validateForm = () => {
    return yup
      .object()
      .shape(validation)
      .validate(
        { exchange: exchange.value, apiName, ...exchangeForm },
        { abortEarly: false }
      )
      .catch((error) => {
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

    if (isFormValid) {
      let body = {
        apiKeyName: apiName,
        exchange: exchange.value,
        keyData: exchangeForm,
      }

      onSave(body)
    }
  }

  const renderInputValidationError = (errorKey) => (
    <>
      {errors[errorKey] && (
        <div className="d-flex align-items-center text-danger">
          {errors[errorKey]}
        </div>
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
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
          onSubmit={handleSubmit}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                <Key className="mr-3" size="20" strokeWidth="3" />
                Connect new exchange
              </h5>
              <button
                onClick={onClose}
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true" className="modal-cross">
                  &times;
                </span>
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <a
                  href={exchange && supportLinks[exchange.value]}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'underline', color: '#718096' }}
                >
                  How to find my API keys?
                </a>
              </div>

              <div className="mb-3 row">
                <div className="col-md-4">
                  <Select
                    placeholder="Choose Exchange"
                    value={exchange}
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    onChange={(exchange) => {
                      setExchange(exchange)
                      validateInput({ name: 'exchange', value: exchange.value })
                    }}
                    styles={customStyles}
                    options={exchangeOptions}
                    formatOptionLabel={(element) => (
                      <div>
                        <span>{element.placeholder}</span>
                        {!isPaidUser &&
                          element.value === 'bybit' &&
                          !isException && (
                            <span
                              style={{ marginLeft: '1rem' }}
                              class="badge badge-warning"
                            >
                              Only paid users
                            </span>
                          )}
                      </div>
                    )}
                  />
                </div>
                {renderInputValidationError('exchange')}
              </div>

              <div className="form-group">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">Name</span>
                  </div>
                  <input
                    type="text"
                    disabled={isLoading}
                    className="form-control"
                    name="apiName"
                    value={apiName}
                    onChange={(event) => {
                      validateInput({
                        name: event.target.name,
                        value: event.target.value,
                      })
                      setApiName(event.target.value)
                    }}
                    placeholder={`${exchange.placeholder}1`}
                  />
                </div>
                {renderInputValidationError('apiName')}
              </div>
              {exchangeForm &&
                formFields &&
                Object.entries(formFields).map((key) => (
                  <div className="form-group">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon1">
                          {key[0]}
                        </span>
                      </div>
                      <input
                        type="text"
                        disabled={isLoading}
                        className="form-control"
                        placeholder={key[0] === 'Key' ? 'API Key' : key[0]}
                        name={key[1]}
                        value={exchangeForm[key[1]]}
                        onChange={(event) => {
                          validateInput({
                            name: event.target.name,
                            value: event.target.value,
                          })
                          setExchangeForm((state) => {
                            return { ...state, [key[1]]: event.target.value }
                          })
                        }}
                        aria-label={key[1]}
                        aria-describedby="basic-addon1"
                      />
                    </div>
                    {renderInputValidationError(key[1])}
                  </div>
                ))}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                disabled={isLoading}
                type="submit"
                className="btn btn-primary"
              >
                {!isLoading ? (
                  'Save'
                ) : (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  )
}

export default QuickModal
