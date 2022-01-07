import React, { useContext, useState, useEffect, useMemo } from 'react'
import { useNotifications } from 'reapop'
import { Link } from 'react-router-dom'
import Select, { components } from 'react-select'
import * as yup from 'yup'
import { analytics } from '../../firebase/firebase'
import { Event } from '../../Tracking'
import { UserContext } from '../../contexts/UserContext'
import { useSymbolContext } from '../context/SymbolContext'
import {
  addUserExchange,
  updateLastSelectedAPIKey,
  getUserExchanges,
} from '../../api/api'
import { useHistory } from 'react-router-dom'
import {
  options,
  validationRules,
  exchangeCreationOptions,
} from '../../constants/ExchangeOptions'
import './index.css'
import { supportLinks } from '../../constants/SupportLinks'
import { ONBOARDING_MODAL_TEXTS } from '../../constants/Trade'
import { sortExchangesData } from '../../helpers/apiKeys'
import {
  updateLastSelectedValue,
  getFirestoreDocumentData,
} from '../../api/firestoreCall'

const OnboardingModal = () => {
  const { refreshExchanges } = useSymbolContext()
  const {
    loadApiKeys,
    setLoadApiKeys,
    isLoggedIn,
    setTotalExchanges,
    setActiveExchange,
    getSubscriptionsData,
    onTour,
    setOnTour,
    handleOnboardingSkip,
    isOnboardingSkipped,
    isPaidUser,
    userData,
    isException,
    state,
  } = useContext(UserContext)
  const history = useHistory()
  const { notify } = useNotifications()

  const [step, setStepNo] = useState(1)
  const [apiProc, setIsApiProc] = useState(false)
  const [hasError, setError] = useState(false)
  const [exchange, setExchange] = useState({
    value: 'binance',
    label: 'Binance',
    placeholder: 'Binance',
    fields: { Key: 'apiKey', Secret: 'secret' },
  })
  const [apiName, setApiName] = useState('')
  const [validation, setValidation] = useState({})
  const [exchangeForm, setExchangeForm] = useState({})
  const [formFields, setFormFields] = useState()
  const [exchangeCreation, setExchangeCreation] = useState()

  const errorInitialValues = {
    exchange: '',
    apiName: '',
  }

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
  }, [isPaidUser])

  const newExchangeOptions = useMemo(() => {
    return options.map((element) => {
      if (element.value === 'bybit' && !isPaidUser) {
        return { ...element, isDisabled: true }
      }
      return element
    })
  }, [isPaidUser])

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

  const addExchange = async () => {
    try {
      setIsApiProc(true)
      setError(false)
      if (apiProc) return

      let body = {
        apiKeyName: apiName,
        exchange: exchange.value,
        keyData: exchangeForm,
      }

      let result = await addUserExchange(body)

      if (result.status !== 200) {
        setError(true)
      } else {
        let value = `${apiName}-${exchange.value}`
        await updateLastSelectedValue(userData.email, value)
        setStepNo(step + 1)
        notify({
          status: 'success',
          title: 'Success',
          message: 'API key added!',
        })
        analytics.logEvent('api_keys_added')
        Event('user', 'api_keys_added', 'user')
      }
    } catch (e) {
      console.log(e)
    } finally {
      setIsApiProc(false)
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

  const onTertiaryBtnClick = async () => {
    handleOnboardingSkip()
    history.push('/chartview')
  }

  const onPrimaryBtnClick = async () => {
    if (step === 1) {
      if (state && state.has2FADetails) {
        setStepNo(step + 1)
      } else {
        history.push('/settings#security')
      }
    } else if (step === 2) {
      const isFormValid = await validateForm()

      if (isFormValid) {
        addExchange()
      }
    } else if (step === 3) {
      sessionStorage.clear()
      try {
        getFirestoreDocumentData('apiKeyIDs', userData.email).then((apiKey) => {
          if (apiKey.data()) {
            let apiKeys = sortExchangesData(apiKey.data())
            if (apiKeys) {
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
          }
        })
      } catch (e) {
        console.log(e)
      } finally {
        setLoadApiKeys(true)
      }
    }
  }

  const customStyles = {
    control: (styles) => ({
      ...styles,
      backgroundColor: '#eff2f7',
      padding: '7px 10px',
      border: 0,
      boxShadow: 'none',
      '& div': {
        textAlign: 'center',
      },

      '&:hover': {
        backgroundColor: '#d6ddea',
        cursor: 'pointer',
      },
    }),

    placeholder: (styles) => ({
      ...styles,
      color: '#273444',
      fontWeight: 600,
    }),
  }

  const modalVisibility = () => {
    if (isLoggedIn) {
      if (loadApiKeys) return 'none'
      else return 'block'
    } else {
      return 'none'
    }
  }

  const modalStyle = {
    background: 'rgba(0,0,0,.5)',
    display: modalVisibility(),
  }

  const handleExchangeCreation = (exchange) => {
    setExchangeCreation(exchange)
  }

  const Option = (props) => {
    return (
      <>
        <components.Option {...props}>
          <a
            href={props.data.url}
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              maxHeight: '1rem',
            }}
            rel="noreferrer"
          >
            <img
              src={props.data.image}
              alt={props.children}
              style={
                props.data.value === 'binance'
                  ? { width: 100 }
                  : props.data.value === 'kucoin'
                  ? { width: 105 }
                  : props.data.value === 'bybit'
                  ? { width: 80 }
                  : { width: 120 }
              }
            />
            {!isPaidUser && props.data.value === 'bybit' && !isException && (
              <span
                style={{ marginLeft: '1rem' }}
                className="badge badge-warning"
              >
                Only paid users
              </span>
            )}
          </a>
        </components.Option>
      </>
    )
  }

  return (
    <>
      <div
        className={`modal fade docs-example-modal-lg pt-5 show`}
        style={modalStyle}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title h6">
                {ONBOARDING_MODAL_TEXTS[step].title}
              </h5>
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
                {Object.entries(ONBOARDING_MODAL_TEXTS).map((item, index) => (
                  <div className="pl-0 col-4" key={`progressbar-${item}`}>
                    <div
                      className="rounded-sm progress"
                      style={{ height: '12px' }}
                    >
                      <div
                        className={`progress-bar ${
                          step >= index + 1 ? 'w-100' : ''
                        }`}
                        role="progressbar"
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <h4>{ONBOARDING_MODAL_TEXTS[step].heading}</h4>
              <div className={`step1 ${step === 1 ? 'd-show' : 'd-none'}`}>
                <p className="lead">{ONBOARDING_MODAL_TEXTS[step].text1}</p>
                <p className="lead">{ONBOARDING_MODAL_TEXTS[step].text2}</p>
              </div>
              <div className={`step2 ${step === 2 ? 'd-show' : 'd-none'}`}>
                <p>
                  <a
                    className="pb-2 text-muted text-underline"
                    href={exchange && supportLinks[exchange.value]}
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
                        validateInput({
                          name: 'exchange',
                          value: exchange.value,
                        })
                      }}
                      styles={customStyles}
                      options={exchangeOptions}
                      formatOptionLabel={(element) => (
                        <div key={element.value}>
                          <span>{element.placeholder}</span>
                          {!isPaidUser &&
                            element.value === 'bybit' &&
                            !isException && (
                              <span
                                style={{ marginLeft: '1rem' }}
                                className="badge badge-warning"
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
                          disabled={apiProc}
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
                <div
                  className={`alert alert-danger ${
                    hasError ? 'd-show' : 'd-none'
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
              <div className={step === 1 ? 'modal-footer-action' : ''}>
                {step !== 1 ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onSecondaryBtnClick}
                    disabled={apiProc}
                  >
                    {ONBOARDING_MODAL_TEXTS[step].secBtn}
                  </button>
                ) : (
                  <Select
                    placeholder="Create a new exchange account"
                    value={exchangeCreation}
                    components={{
                      IndicatorSeparator: () => null,
                      Option,
                    }}
                    className="exchange-dropdown"
                    onChange={handleExchangeCreation}
                    styles={customStyles}
                    options={exchangeCreationOptions}
                    isSearchable={false}
                  />
                )}
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onPrimaryBtnClick}
                  disabled={step === 2 && apiProc}
                >
                  {!apiProc ? (
                    ONBOARDING_MODAL_TEXTS[step].primaryBtn
                  ) : (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>
              {!isOnboardingSkipped && step === 1 && (
                <button
                  type="button"
                  className="btn btn-secondary terBtn"
                  onClick={onTertiaryBtnClick}
                >
                  {ONBOARDING_MODAL_TEXTS[step].terBtn}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OnboardingModal
