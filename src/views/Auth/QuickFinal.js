import React, { useEffect, useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Logo, Icon } from '../../components'
import { firebase } from '../../firebase/firebase'

// https://reactrouter.com/web/example/query-parameters
function useQuery() {
  return new URLSearchParams(useLocation().search)
}

const QuickConfirm = () => {
  const [validEmail, setValidEmail] = useState(false)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [type, setType] = useState('password')
  const [tos, setTos] = useState(false)
  const [validForm, setValidForm] = useState(false)
  const [done, setDone] = useState(false)

  const query = useQuery()

  const checkEmail = useCallback(async () => {
    const actionCode = query.get('oobCode')
    await handleVerifyEmail(actionCode)
  }, [query])

  useEffect(() => {
    checkEmail()
  }, [checkEmail])

  const toggleTypeText = () => {
    if (type === 'text') {
      setType('password')
    } else {
      setType('text')
    }
  }

  function handleVerifyEmail(actionCode, continueUrl) {
    // Localize the UI to the selected language as determined by the lang
    // parameter.
    // Try to apply the email verification code.

    firebase
      .auth()
      .applyActionCode(actionCode)
      .then(function () {
        // Email address has been verified.
        setValidEmail(true)

        // TODO: If a continue URL is available, display a button which on
        // click redirects the user back to the app via continueUrl with
        // additional state determined from that URL's parameters.
      })
      .catch(function (error) {
        // Code is invalid or expired. Ask the user to verify their email address
        // again.
        setError(error)
      })
  }

  async function registerPassword() {
    await firebase.auth().currentUser.updatePassword(password)

    setTimeout(() => {
      setDone(true)
    }, 300)
  }

  useEffect(() => {
    setValidForm(password && tos)
  }, [password, tos])

  if (done) {
    return (
      <div className="container d-flex flex-column">
        <div className="row align-items-center justify-content-center min-vh-100">
          <div className="col-md-6 col-lg-5 col-xl-4 py-6 py-md-0">
            <div className="mb-4">
              <Logo />
            </div>

            <div>
              <p>We are all done. Now login to start using your account.</p>
              <Link to="/login">
                <button class="btn btn-primary">Sign in</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section>
      <div className="container d-flex flex-column">
        <div className="row align-items-center justify-content-center min-vh-100">
          <div className="col-md-6 col-lg-5 col-xl-4 py-6 py-md-0">
            <div className="mb-4">
              <Logo />
            </div>

            <div className="mb-4">
              <h6 className="h4 mb-4">Confirmation page</h6>

              {!validEmail && !error && <p>Confirming your email...</p>}

              {error && (
                <div>
                  <div className="text-danger mt-3 mb-3">{error.message}</div>

                  <p className="text-muted mb-0">
                    <Link to="/register">Try again..</Link>
                  </p>
                </div>
              )}

              {validEmail && (
                <div>
                  <p>
                    Your email has been verifed. Please fill in the fields below
                    to finish your registration.
                  </p>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault()

                      if (password) {
                        registerPassword()
                      }
                    }}
                  >
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
                            <Icon icon="key" />
                          </span>
                        </div>
                      </div>
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
                          <a href="../../pages/utility/terms.html">
                            Terms of Service
                          </a>{' '}
                          and the{' '}
                          <a href="../../pages/utility/terms.html">
                            Privacy Policy
                          </a>
                        </label>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="submit"
                        disabled={!validForm}
                        className="btn btn-block btn-primary"
                      >
                        Create my account
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default QuickConfirm
