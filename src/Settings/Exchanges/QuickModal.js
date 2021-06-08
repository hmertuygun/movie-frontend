import React, { useState, useEffect } from 'react'
import { Key } from 'react-feather'
import Select from 'react-select'
import * as yup from 'yup'
import { options } from './ExchangeOptions'

const QuickModal = ({ onClose, onSave, isLoading, isVisible }) => {
  const [exchange, setExchange] = useState({
    value: 'binance',
    label: 'Binance',
  })
  const [apiName, setApiName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [secret, setSecret] = useState('')

  const errorInitialValues = {
    exchange: '',
    apiName: '',
    apiKey: '',
    secret: '',
  }

  const [errors, setErrors] = useState(errorInitialValues)

  const customStyles = {
    control: (styles, { }) => ({
      ...styles,
      backgroundColor: '#eff2f7',
      padding: '5px 5px',
      border: 0,
      boxShadow: 'none',

      '&:hover': {
        backgroundColor: '#d6ddea',
        cursor: 'pointer',
      },
    }),

    placeholder: (styles) => ({
      ...styles,
      color: '#273444',
      fontWeight: 'bold',
    }),
  }

  const formSchema = yup.object().shape({
    exchange: yup.string().required('Exchange is required'),
    apiName: yup
      .string()
      .required('API Name is required')
      .min(3, 'Must be at least 3 characters')
      .matches(/^\w+$/, {
        message: 'Accepted characters are A-Z, a-z, 0-9 and underscore.',
        excludeEmptyString: true,
      }),
    apiKey: yup
      .string()
      .required('API Key is required')
      .min(3, 'Must be at least 3 characters'),
    secret: yup.string().required('API Secret is required'),
  })

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

  const validateForm = () => {
    return formSchema
      .validate(
        { exchange: exchange.value, apiName, apiKey, secret },
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
      onSave({ secret, apiKey, exchange: exchange.value, name: apiName })
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
                <span aria-hidden="true" className="modal-cross">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <a
                  href="https://support.coinpanel.com/hc/en-us/articles/360018767359-Connecting-your-Binance-account-to-CoinPanel"
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
                    options={options}
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
                    placeholder={`${exchange.label}1`}
                  />
                </div>
                {renderInputValidationError('apiName')}
              </div>

              <div className="form-group">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon1">
                      Key
                    </span>
                  </div>
                  <input
                    type="text"
                    disabled={isLoading}
                    className="form-control"
                    placeholder="API Key"
                    name="apiKey"
                    value={apiKey}
                    onChange={(event) => {
                      validateInput({
                        name: event.target.name,
                        value: event.target.value,
                      })
                      setApiKey(event.target.value)
                    }}
                    aria-label="apikey"
                    aria-describedby="basic-addon1"
                  />
                </div>
                {renderInputValidationError('apiKey')}
              </div>

              <div className="form-group">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon1">
                      Secret
                    </span>
                  </div>
                  <input
                    type="text"
                    disabled={isLoading}
                    className="form-control"
                    name="secret"
                    value={secret}
                    onChange={(event) => {
                      validateInput({
                        name: event.target.name,
                        value: event.target.value,
                      })
                      setSecret(event.target.value)
                    }}
                    placeholder="Secret"
                  />
                </div>
                {renderInputValidationError('secret')}
              </div>
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
