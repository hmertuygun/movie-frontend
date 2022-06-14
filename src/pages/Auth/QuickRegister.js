import React, { useContext, useState, useEffect, useMemo } from 'react'
import { Key, AtSign } from 'react-feather'
import { Link, Redirect } from 'react-router-dom'
import { UserContext } from 'contexts/UserContext'
import { Logo } from 'components'
import { firebase } from 'services/firebase'
import Select from 'react-select'
import countryList from 'react-select-country-list'
import useQuery from 'hooks/useQuery'
import './QuickRegister.css'
import {
  initDrawingDocuments,
  initUserData,
  updateSingleValue,
} from 'services/api/Firestore'
import { defaultSymbol } from 'constants/defaultSymbol'
import DefaultRegisterTemplate from './components/templates/default'
import ChartRegisterTemplate from './components/templates/chartMirroring'
import BybitRegisterTemplate from './components/templates/bybitTemplate'
import { fbPixelTracking } from 'services/tracking'

const QuickRegister = () => {
  const { register, isSubOpen } = useContext(UserContext)
  const query = useQuery()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [redirect, setRedirect] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [type, setType] = useState('password')
  const [tos, setTos] = useState(false)
  const [validForm, setValidForm] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [country, setCountry] = useState('')
  const [registerType, setRegisterType] = useState(query.get('t'))

  const getReferral = (uid) => {
    const referral = query.get('irclickid')
    let data = null
    if (referral) {
      data = {
        referral: 'impact',
        created: firebase.firestore.FieldValue.serverTimestamp(),
        code: referral,
        userId: uid,
      }
    } else if (registerType === 'bybit' || registerType === 'chartmirroring') {
      data = {
        referral: registerType,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        userId: uid,
      }
    }
    return data
  }

  const options = useMemo(() => countryList().getData(), [])

  const registerTemplate = useMemo(() => {
    switch (registerType) {
      case 'chartmirroring':
        return <ChartRegisterTemplate />
      case 'bybit':
        return <BybitRegisterTemplate />
      default:
        return <DefaultRegisterTemplate />
    }
  }, [registerType])

  useEffect(() => {
    fbPixelTracking('Register page view')
  }, [])

  useEffect(() => {
    setError('')
    setValidForm(email && password && tos && country)
  }, [email, password, tos, country])

  const toggleTypeText = () => {
    if (type === 'text') {
      setType('password')
    } else {
      setType('text')
    }
  }

  const handleCountrySelection = (value) => {
    setCountry(value)
  }

  const getFPTid = useMemo(() => {
    return window.FPROM && window.FPROM.data.tid
  }, [])

  const actualRegister = async () => {
    try {
      const response = await register(email, password)

      if (response.message) {
        throw new Error(response.message)
      }

      try {
        const actionCodeSettings = {
          url:
            window.location.origin +
            '?email=' +
            firebase.auth().currentUser.email,
          handleCodeInApp: true,
        }

        response.user
          .sendEmailVerification(actionCodeSettings)
          .then(async () => {
            const refId = getFPTid
            if (response?.user) {
              try {
                if (refId)
                  await updateSingleValue(response?.user?.uid, 'stripe_users', {
                    refId: refId,
                  })
                await initDrawingDocuments(email, {
                  lastSelectedSymbol: defaultSymbol,
                })

                await initUserData(email, {
                  country: country,
                  firstLogin: true,
                })
                const referals = getReferral(response.user.uid)

                if (referals) {
                  await updateSingleValue(email, 'referrals', referals)
                }
              } catch (error) {
                console.log('==>', error)
              }
            }

            setRedirect('/register/confirm')
          })
      } catch (error) {
        console.error(error)
        setIsLoading(false)
        setError(error)
      }
    } catch (error) {
      console.error(error.message)
      setIsLoading(false)
      setError(error)
    }
  }

  if (redirect) {
    return <Redirect to={redirect} />
  }

  let validationPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})/

  const handleSubmit = (e) => {
    let validPassword = validationPattern.test(password)
    setIsSubmitted(true)
    e.preventDefault()
    if (!isLoading) {
      if (email && validPassword) {
        setIsLoading(true)
        actualRegister()
        fbPixelTracking('Create my account button clicked')
      }
    }
  }

  return (
    <section
      style={{ backgroundColor: '#E1E1E1' }}
      className="row h-100vh align-items-center"
    >
      <div className="col-lg-6 px-4 desktop-section">
        <div
          className="zindex-100 content-wrapper p-5 position-relative"
          style={{
            backgroundColor: '#1652F1',
          }}
        >
          {registerTemplate}
        </div>
      </div>

      <div className="col-lg-6 col-sm-12 px-4">
        <div className="d-flex flex-column bg-white justify-content-center content-wrapper">
          <div className="form-container mx-auto">
            <div className="mb-4">
              <Logo />
            </div>
            {isSubOpen ? (
              <div>
                <div className="mb-4">
                  <h6 className="h4 mb-1">Create your free account</h6>
                  <p className="text-muted mb-0">No credit card required.</p>
                </div>
                <span className="clearfix"></span>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-control-label">Email address</label>
                    <div className="input-group input-group-merge">
                      <input
                        type="email"
                        className="form-control form-control-prepend"
                        id="input-email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <AtSign size="16" strokeWidth="3" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div style={{ margin: '1rem 0', textAlign: 'center' }}>
                      <span style={{ color: 'red' }}>{error.message}</span>
                    </div>
                  )}
                  <div className="form-group">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <label className="form-control-label">Password</label>
                      </div>
                      <div className="mb-2">
                        <div
                          className="small text-muted text-underline--dashed border-primary"
                          onClick={() => toggleTypeText()}
                          style={{ cursor: 'pointer' }}
                        >
                          {type === 'text' ? 'Hide Password' : 'Show Password'}
                        </div>
                      </div>
                    </div>
                    <div className="input-group input-group-merge">
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={type || 'password'}
                        className="form-control form-control-prepend"
                        id="input-password"
                        placeholder="Password"
                      />
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <Key size="16" strokeWidth="3" />
                        </span>
                      </div>
                    </div>
                  </div>
                  {isSubmitted &&
                    password &&
                    !validationPattern.test(password) && (
                      <div className="text-sm text-danger">
                        Password must contain at least 6 characters, including 1
                        uppercase letter, 1 lowercase letter and 1 number.
                      </div>
                    )}
                  <div className="form-group  mb-0">
                    <label className="form-control-label">Country</label>
                    <Select
                      options={options}
                      value={country}
                      onChange={handleCountrySelection}
                      className="input-group-merge country-border"
                    />
                  </div>

                  <div className="my-4">
                    <div className="custom-control custom-checkbox mb-3">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="check-terms"
                        checked={tos}
                        onChange={(event) => {
                          setTos(event.target.checked)
                        }}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="check-terms"
                      >
                        I agree to the{' '}
                        <a
                          href="https://coinpanel.com/terms"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Terms of Service
                        </a>{' '}
                        and the{' '}
                        <a
                          href="https://coinpanel.com/privacy-policy"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="submit"
                      className="btn btn-block btn-primary"
                      disabled={!validForm}
                    >
                      {isLoading ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        />
                      ) : (
                        'Create my account'
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-4 text-center">
                  <small>Already have an account? </small>
                  <Link to="/login">
                    <span className="small font-weight-bold">Sign in</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center">
                Sorry for the inconvenience. Our registration system is under
                maintenance, please check later.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default QuickRegister
