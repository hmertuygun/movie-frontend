import React, { useState, useEffect } from 'react'
import { User } from 'react-feather'
import { Link } from 'react-router-dom'
import { auth } from 'services/firebase'
import { Logo } from 'components'

const RecoverPassword = () => {
  const [email, setEmail] = useState('')
  const [isRecoverSent, setIsRecoverSent] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setLoading] = useState(false)

  // clear errors
  useEffect(() => {
    setError('')
  }, [email])

  const recoverPassword = () => {
    setLoading(true)
    auth
      .sendPasswordResetEmail(email)
      .then(() => {
        setIsRecoverSent(true)
        setLoading(false)
      })
      .catch((error) => {
        setLoading(false)
        setIsRecoverSent(false)
        setError(error)
      })
  }

  return isRecoverSent ? (
    <section>
      <div className="container d-flex flex-column">
        <div className="row align-items-center justify-content-center min-vh-100">
          <div className="col-md-6 col-lg-5 col-xl-4 py-6 py-md-0">
            <div>
              <div className="mb-4">
                <Logo />
              </div>
              <div className="mb-4">
                <h6 className="h4 mb-1">Recover your password</h6>

                <p className="mt-4">
                  If that email was correct, email has been sent with further
                  information.
                </p>
              </div>
              <span className="clearfix"></span>

              <div className="mt-4 text-center">
                <small>Not registered? </small>
                <Link to="/register" className="small font-weight-bold">
                  Create account
                </Link>
              </div>

              <div className="mt-4 text-center">
                <Link to="/login" className="small font-weight-bold">
                  Back to login.
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  ) : (
    <section>
      <div className="container d-flex flex-column">
        <div className="row align-items-center justify-content-center min-vh-100">
          <div className="col-md-6 col-lg-5 col-xl-4 py-6 py-md-0">
            <div>
              <div className="mb-4">
                <Logo />
              </div>
              <div className="mb-4">
                <h6 className="h4 mb-1">Recover your password</h6>

                <p className="mt-4">
                  Provide us with your email and we will help you recover you
                  password.
                </p>
              </div>
              <span className="clearfix"></span>
              <form
                onSubmit={(event) => {
                  event.preventDefault()

                  if (email) {
                    recoverPassword(email)
                  } else {
                    setError({
                      message: 'You need to provide an email..',
                    })
                  }
                }}
              >
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
                        <User size="16" strokeWidth="3" />
                      </span>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-sm mt-3 text-danger">{error.message}</p>
                )}

                <div className="mt-4">
                  <button type="submit" className="btn btn-block btn-primary">
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

              <div className="mt-4 text-center">
                <small>Not registered? </small>
                <Link to="/register" className="small font-weight-bold">
                  Create account
                </Link>
              </div>

              <div className="mt-4 text-center">
                <Link to="/login" className="small font-weight-bold">
                  Back to login.
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RecoverPassword
