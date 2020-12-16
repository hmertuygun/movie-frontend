import React, { Fragment, useContext, useState, useEffect } from 'react'
import { Link, Redirect } from 'react-router-dom'
import { Logo } from '../components'
import { UserContext } from '../contexts/UserContext'
import { Icon } from '../components'

const QuickRegister = () => {
  const { emailRegister } = useContext(UserContext)

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [redirect, setRedirect] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // clear errors
  useEffect(() => {
    setError('')
  }, [email])

  const doRegister = async () => {
    const registerResponse = await emailRegister(email)

    setTimeout(() => {
      setIsLoading(false)
      setRedirect('/register/confirm')
    }, 500)
  }

  if (redirect) {
    return <Redirect to={redirect} />
  }

  return (
    <section>
      <div className="container d-flex flex-column">
        <div className="row align-items-center justify-content-center min-vh-100">
          <div className="col-md-8 col-lg-5 py-6">
            <div>
              <div className="mb-4 text-center">
                <Logo />
              </div>
              <div className="mb-4 text-center">
                <h6 className="h4 mb-1">Create your free account</h6>
                <p className="text-muted mb-0">No credit card required.</p>
              </div>
              <span className="clearfix"></span>

              <form
                onSubmit={(event) => {
                  event.preventDefault()

                  if (!isLoading) {
                    if (email) {
                      setIsLoading(true)
                      doRegister()
                    } else {
                      setError({ message: 'Need your email!' })
                    }
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
                        <Icon icon="at-sign" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* <div className="form-group mb-0">
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
                      type={type}
                      className="form-control form-control-prepend"
                      id="input-password"
                      placeholder="Password"
                    />
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <svg
                          width="24"
                          height="24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <use href="/assets/feather-sprite.svg#key" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div> */}

                {error && (
                  <div style={{ margin: '1rem 0', textAlign: 'center' }}>
                    <span style={{ color: 'red' }}>Error: {error.message}</span>
                  </div>
                )}

                <div className="mt-4">
                  <button
                    type="submit"
                    className="btn btn-block btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Continue'}
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
    </section>
  )
}

export default QuickRegister
