import React, { useContext, useState, useEffect } from 'react'
import { Key, AtSign } from 'react-feather'
import { Link, Redirect } from 'react-router-dom'
import { UserContext } from '../../contexts/UserContext'
import { Logo } from '../../components'
import { firebase } from '../../firebase/firebase'

const QuickRegister = (props) => {
  const { register } = useContext(UserContext)

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [redirect, setRedirect] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [type, setType] = useState('password')
  const [tos, setTos] = useState(false)
  const [validForm, setValidForm] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // clear errors
  useEffect(() => {
    setError('')
    setValidForm(email && password && tos)
  }, [email, password, tos])

  const findActiveTrader = async () => {
    try {
      const [symbol, trader] = props.location.search.split('?')
      if (trader) {
        try {
          const snapshot = await firebase
            .firestore()
            .collection('template_drawings')
            .get()
          const allTraders = snapshot.docs.map((tr) => {
            return { id: tr.id, ...tr.data() }
          })
          const activeTrader = allTraders.find((tr) => tr.nickname == trader)
          if (activeTrader) {
            return {
              activeTrader: activeTrader.id,
              lastSelectedSymbol: 'BINANCE:BTC/USDT',
            }
          }
        } catch (error) {
          return {
            lastSelectedSymbol: 'BINANCE:BTC/USDT',
          }
        }
      } else {
        return {
          lastSelectedSymbol: 'BINANCE:BTC/USDT',
        }
      }
    } catch (error) {}
  }

  const toggleTypeText = () => {
    if (type === 'text') {
      setType('password')
    } else {
      setType('text')
    }
  }

  const actualRegister = async () => {
    try {
      const response = await register(email, password)

      if (response.message) {
        throw new Error(response.message)
      }

      try {
        await firebase
          .firestore()
          .collection('stripe_users')
          .doc(response?.user?.uid)
          .set({ chartMirroringSignUp: true }, { merge: true })
      } catch (error) {
        console.log(error)
      }

      try {
        await firebase
          .firestore()
          .collection('chart_drawings')
          .doc(email)
          .set(await findActiveTrader(), { merge: true })
      } catch (error) {
        console.log(error)
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
            const getFPTid = () => {
              return window.FPROM && window.FPROM.data.tid
            }

            const refId = getFPTid()
            if (refId && response?.user) {
              try {
                await firebase
                  .firestore()
                  .collection('stripe_users')
                  .doc(response?.user?.uid)
                  .set(
                    { refId: refId, chartMirroringSignUp: true },
                    { merge: true }
                  )
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
      }
    }
  }

  return (
    <section>
      <div
        className="position-absolute h-100 top-0 left-0 zindex-100 col-lg-6 col-xl-6 zindex-100 d-none d-lg-flex flex-column justify-content-center"
        style={{ backgroundColor: '#1652f1', minHeight: '860px' }}
      >
        <div className="row position-relative zindex-110 p-5 h-100">
          <div className="col-12 text-center" style={{ height: '180px' }}>
            <figure className="w-100">
              <img
                alt="CoinPanel - Easy cryptocurrency trading bot"
                src="https://coinpanel.com/assets/img/chart-mirroring-title.png"
                className="img-fluid"
                style={{ maxWidth: '340px' }}
              />
            </figure>
          </div>
          <div className="col-md-12 text-center mx-auto">
            <h5 className="h3 text-white mt-0 mb-4">
              Mirror Pro Traders' charts onto your chart. Live!
            </h5>
            <p className="text-white opacity-9 mb-4">
              Get direct access to the Pro Traders' charts without having to
              redraw patterns and trend lines by yourself. Pro Traders' charts
              are now available through Chart Mirroring – everything he charts
              will be copied into yours, whenever you want to see it.
            </p>
            <div className="row align-items-center mx-auto">
              <div className="text-center mx-auto opacity-9">
                <ul className="list-unstyled text-white">
                  <li className="py-2">
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="badge badge-circle badge-dark mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-check"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <span className="mb-0">
                          Everything on the chart will appear live when trader
                          draws it
                        </span>
                      </div>
                    </div>
                  </li>
                  <li className="py-2">
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="badge badge-circle badge-dark mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-check"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <span className="mb-0">Drawings, indicators</span>
                      </div>
                    </div>
                  </li>
                  <li className="py-2">
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="badge badge-circle badge-dark mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-check"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <span className="mb-0">Buy zones</span>
                      </div>
                    </div>
                  </li>
                  <li className="py-2">
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="badge badge-circle badge-dark mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-check"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <span className="mb-0">
                          Take Profit / Stop Loss zones
                        </span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid d-flex flex-column">
        <div className="row align-items-center justify-content-center justify-content-lg-end min-vh-100">
          <div className="col-sm-7 col-lg-6 col-xl-6 py-6 py-lg-0">
            <div className="row justify-content-center">
              <div className="col-11 col-lg-10 col-xl-7">
                <div>
                  <div className="mb-4">
                    <Logo />
                  </div>
                  <div className="mb-4">
                    <h6 className="h4 mb-1">Create your free account</h6>
                  </div>
                  <span className="clearfix"></span>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-control-label">
                        Email address
                      </label>
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
                        <span style={{ color: 'red' }}>
                          Error: {error.message}
                        </span>
                      </div>
                    )}
                    <div className="form-group mb-0">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <label className="form-control-label">Password</label>
                        </div>
                        <div className="mb-2">
                          <div
                            className="small text-muted text-underline--dashed border-primary"
                            onClick={() => toggleTypeText()}
                          >
                            Show password
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
                        <div class="text-sm text-danger">
                          Password must contain at least 6 characters, including
                          1 uppercase letter, 1 lowercase letter and 1 number.
                        </div>
                      )}

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
                            href="https://coinpanel.com/privacy"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default QuickRegister
