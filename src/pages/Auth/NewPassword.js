import React, { useState, useEffect, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { auth } from 'services/firebase'
import { Logo, Icon } from 'components'
import MESSAGES from 'constants/Messages'

const NewPassword = ({ actionCode }) => {
  const [recoverEmail, setRecoverEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [type, setType] = useState('password')
  const [isDone, setDone] = useState(false)
  const [isLoading, setLoading] = useState(false)

  // clear errors
  useEffect(() => {
    setError('')
  }, [password])

  const toggleTypeText = () => {
    if (type === 'text') {
      setType('password')
    } else {
      setType('text')
    }
  }

  useEffect(() => {
    //
    // Localize the UI to the selected language as determined by the lang
    // parameter.

    // Verify the password reset code is valid.
    auth
      .verifyPasswordResetCode(actionCode)
      .then(function (email) {
        // TODO: Show the reset screen with the user's email and ask the user for
        // the new password.
        setRecoverEmail(email)
      })
      .catch(function (error) {
        // Invalid or expired action code. Ask user to try to reset the password
        // again.
        setError(error)
      })
  })

  // set the new password
  function resetPassword() {
    setLoading(true)
    // Save the new password.
    auth
      .confirmPasswordReset(actionCode, password)
      .then(function (resp) {
        // Password reset has been confirmed and new password updated.
        // TODO: Display a link back to the app, or sign-in the user directly
        // if the page belongs to the same domain as the app:
        setDone(true)
        setLoading(false)
        // TODO: If a continue URL is available, display a button which on
        // click redirects the user back to the app via continueUrl with
        // additional state determined from that URL's parameters.
      })
      .catch(function (error) {
        // Error occurred during confirmation. The code might have expired or the
        // password is too weak.
        setError(error)
        setLoading(false)
      })
  }

  return (
    <section>
      <div className="container d-flex flex-column">
        <div className="row align-items-center justify-content-center min-vh-100">
          <div className="col-md-6 col-lg-5 col-xl-4 py-6 py-md-0">
            <div>
              <div className="mb-4">
                <Logo />
              </div>

              {isDone ? (
                <div className="mb-4">
                  <h6 className="h4 mb-1">Reset your password</h6>
                  <p className="mt-4">
                    New password has been set, get back to login and use your
                    new credentials
                  </p>
                </div>
              ) : (
                <Fragment>
                  <div className="mb-4">
                    <h6 className="h4 mb-1">Reset your password</h6>
                    <p className="mt-4">
                      Set a good new password for account {recoverEmail}.
                    </p>
                  </div>

                  <span className="clearfix"></span>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault()
                      let validationPattern =
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})/
                      if (password) {
                        let validPassword = validationPattern.test(password)
                        if (!validPassword) {
                          setError({
                            message: MESSAGES['invalid-password'],
                          })
                          return
                        }
                        setLoading(true)
                        resetPassword(password)
                      } else {
                        setError({
                          message: MESSAGES['empty-password'],
                        })
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
                            style={{ cursor: 'pointer' }}
                          >
                            {type === 'text'
                              ? 'Hide Password'
                              : 'Show Password'}
                          </div>
                        </div>
                      </div>
                      <div className="input-group input-group-merge">
                        <input
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          type={type}
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

                    {error && (
                      <p className="text-sm mt-3 text-danger">
                        {error.message}
                      </p>
                    )}

                    <div className="mt-4">
                      <button
                        disabled={isLoading}
                        type="submit"
                        className="btn btn-block btn-primary"
                      >
                        {isLoading ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          />
                        ) : (
                          'Recover password'
                        )}
                      </button>
                    </div>
                  </form>
                </Fragment>
              )}

              <div className="mt-4 text-center">
                <Link to="/login" className="small font-weight-bold">
                  Back to log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

NewPassword.propTypes = {
  actionCode: PropTypes.string,
}

export default NewPassword
