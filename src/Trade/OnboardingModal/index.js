import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import * as yup from 'yup'

import { analytics } from '../../firebase/firebase'
import { Event } from '../../Tracking'
import { UserContext } from '../../contexts/UserContext'
import { useSymbolContext } from '../../Trade/context/SymbolContext'
import { successNotification } from '../../components/Notifications'
import {
  addUserExchange,
  getUserExchanges,
  updateLastSelectedAPIKey,
} from '../../api/api'
import { options } from '../../Settings/Exchanges/ExchangeOptions'
import "./index.css"

const OnboardingModal = () => {
  const { refreshExchanges } = useSymbolContext()
  const {
    loadApiKeys,
    setLoadApiKeys,
    loadApiKeysError,
    isLoggedIn,
    setTotalExchanges,
    setActiveExchange,
    getSubscriptionsData,
    onTour,
    setOnTour,
    setLoadApiKeysError
  } = useContext(UserContext)
  let formData = {
    apiKey: '',
    secret: '',
    exchange: 'binance',
    name: '',
  }
  const [step, setStepNo] = useState(1)
  const [apiProc, setIsApiProc] = useState(false)
  const [hasError, setError] = useState(false)
  const [startExp, setStartExp] = useState(false)
  const [exchange, setExchange] = useState({ value: 'binanceus', label: 'Binance.US', placeholder: 'BinanceUS' })
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
      .matches(/^[a-zA-Z0-9]+$/, {
        message: 'Accepted characters are A-Z, a-z and 0-9.',
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

  let btnText = {
    1: {
      primaryBtn: 'Continue with existing Binance account',
      secBtn: 'Set up a new Binance account',
      heading: 'Welcome to CoinPanel!',
    },
    2: {
      primaryBtn: 'Continue',
      secBtn: 'Go Back',
      heading: 'Connect your exchange account',
    },
    3: {
      primaryBtn: 'Start the CoinPanel experience',
      secBtn: 'Checkout the tutorials',
      heading: 'Exchange integration complete!',
    },
  }

  const onPrimaryBtnClick = async () => {
    if (step === 1) {
      setStepNo(step + 1)
    } else if (step === 2) {
      const isFormValid = await validateForm()

      if (isFormValid) {
        addExchange()
      }
    } else if (step === 3) {
      sessionStorage.clear()
      try {
        const hasKeys = await getUserExchanges()
        if (hasKeys?.data?.apiKeys) {
          const { apiKeys } = hasKeys.data
          setTotalExchanges(apiKeys)
          setActiveExchange({
            label: `${exchange.value} - ${apiName}`,
            value: `${exchange.value} - ${apiName}`,
            apiKeyName: apiName,
            exchange: exchange.value,
          })
          refreshExchanges()
          setOnTour(!onTour)
          getSubscriptionsData()
        }
      } catch (e) {
        console.log(e)
      } finally {
        setLoadApiKeys(true)
      }
    }
  }

  const onSecondaryBtnClick = () => {
    if (step === 1) {
      window.open('https://www.binance.com/en/register?ref=UR7ZCKEJ')
    } else if (step === 2) {
      setError(false)
      setStepNo(step - 1)
    } else if (step === 3) {
      window.open('https://support.coinpanel.com/hc/en-us')
    }
  }

  const addExchange = async () => {
    try {
      setIsApiProc(true)
      setError(false)
      if (apiProc) return

      let result = await addUserExchange({
        secret,
        apiKey,
        exchange: exchange.value,
        name: apiName,
      })

      if (result.status !== 200) {
        setError(true)
      } else {
        await updateLastSelectedAPIKey({
          apiKeyName: apiName,
          exchange: exchange.value,
        })
        setStepNo(step + 1)
        successNotification.open({ description: 'API key added!' })
        analytics.logEvent('api_keys_added')
        Event('user', 'api_keys_added', 'user')
      }
    } catch (e) {
      console.log(e)
    } finally {
      setIsApiProc(false)
    }
  }

  const modalVisibility = () => {
    if (isLoggedIn) {
      if(!loadApiKeysError) {
        if (loadApiKeys) return 'none'
        else return 'block'
      }  
    } else {
      return 'none'
    }
  }

  const errorModalVisibility = () => {
    if (isLoggedIn) {
      if (loadApiKeysError) return 'block'
      else return 'none'
    } else {
      return 'none'
    }
  }

  const modalStyle = {
    background: 'rgba(0,0,0,.5)',
    display: modalVisibility(),
  }

  const errorModalStyle = {
    background: 'rgba(0,0,0,.5)',
    display: errorModalVisibility(),
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

  console.log(loadApiKeysError)

  return (
    <>
      <div
        className={`modal fade docs-example-modal-lg pt-5 show`}
        style={modalStyle}
      >
        <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title h6">Exchange Setup</h5>
                <div>
                  <Link to="/settings">
                    <button type="button" className="px-0 py-0 mr-3 btn btn-link">
                      Settings
                    </button>
                  </Link>
                  <Link to="/logout">
                    <button type="button" className="px-0 py-0 btn btn-link">
                      Logout
                    </button>
                  </Link>
                </div>
              </div>
              <div className="modal-body">
                <div className="mb-3 ml-0 text-center row">
                  {Object.entries(btnText).map((item, index) => (
                    <div className="pl-0 col-4" key={`progressbar-${item}`}>
                      <div
                        className="rounded-sm progress"
                        style={{ height: '12px' }}
                      >
                        <div
                          className={`progress-bar ${step >= index + 1 ? 'w-100' : ''
                            }`}
                          role="progressbar"
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <h4>{btnText[step].heading}</h4>
                <div className={`step1 ${step === 1 ? 'd-show' : 'd-none'}`}>
                  <p className="lead">
                    You need a Binance Exchange account to use CoinPanel.
                  </p>
                  <p className="lead">
                    Do you have an existing account that you would like to connect,
                    or would you like to create a new Binance account?
                  </p>
                </div>
                <div className={`step2 ${step === 2 ? 'd-show' : 'd-none'}`}>
                  <p>
                    <a
                      className="pb-2 text-muted text-underline"
                      href="https://support.coinpanel.com/hc/en-us/articles/360018767359-Connecting-your-Binance-account-to-CoinPanel"
                      target="_blank"
                      rel="noreferrer notarget"
                    >
                      How to find my API keys?
                    </a>
                  </p>

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
                  <div className="form-group">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon1">
                          Key
                        </span>
                      </div>
                      <input
                        type="text"
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
                  <div
                    className={`alert alert-danger ${hasError ? 'd-show' : 'd-none'
                      }`}
                    role="alert"
                  >
                    <p>&#10005; Error connecting exchange!</p>
                  </div>
                </div>
                <div className={`step3 ${step === 3 ? 'd-show' : 'd-none'}`}>
                  <p>Your account is good to go.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onSecondaryBtnClick}
                  disabled={apiProc}
                >
                  {btnText[step].secBtn}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onPrimaryBtnClick}
                  disabled={step === 2 && apiProc}
                >
                  {!apiProc ? (
                    btnText[step].primaryBtn
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
        </div>
      </div>
      <div
        className={`modal fade docs-example-modal-lg pt-5 show`}
        style={errorModalStyle}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-body">
              <p className="lead lead-warning">
                We are having difficulty reaching to CoinPanel servers. Your trades are safe. Please refresh the page and try again.
              </p>
            </div>
          </div> 
        </div>
      </div>
    </>
  )
}

export default OnboardingModal
