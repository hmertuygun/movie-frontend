import React, { useState, useEffect, useContext } from 'react'
import { Link, Redirect } from 'react-router-dom'
import { Logo, Icon } from '../../components'
import { UserContext } from '../../contexts/UserContext'

const QuickLogin = () => {
  const { login, isLoggedInWithFirebase } = useContext(UserContext)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [redirect, setRedirect] = useState('')
  const [type, setType] = useState('password')
  const [isLoading, setLoading] = useState(false)

  // clear errors
  useEffect(() => {
    setError('')
    setLoading(false)
  }, [email, password])

  const doLogin = async () => {
    setLoading(true)
    console.log("checking login")
    try {
      const loggedin = await login(email, password)
      if (loggedin.code == 'EVNEED') {
        console.log("redirecting")
        setRedirect("/register/confirm")
      } else if (loggedin.code == "auth/wrong-password") {
        setError({ message: "Incorrect password" })
      } else {
        if (loggedin.message) {
          setError({ message: loggedin.message })
        }
      }
    } catch (e) {}
    setLoading(false)
  }

  const toggleTypeText = () => {
    if (type === 'text') {
      setType('password')
    } else {
      setType('text')
    }
  }

  if (redirect) {
    return <Redirect to={redirect} />
  }

  if (isLoggedInWithFirebase) {
    return <Redirect to="/login/verify2fa" />
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
              <div className="mb-4">
                <h6 className="h4 mb-1">Login</h6>
              </div>
              <span className="clearfix"></span>
              <form
                onSubmit={(event) => {
                  event.preventDefault()

                  if (email && password) {
                    doLogin()
                  } else {
                    setError({
                      message: 'You need both email and password to sign in',
                    })
                    setLoading(false)
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
                        <Icon icon="user" />
                      </span>
                    </div>
                  </div>
                </div>
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
                  <p className="text-sm mt-3 text-danger">{error.message}</p>
                )}

                <div className="mt-4">
                  <button
                    type="submit"
                    className="btn btn-block btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : (
                      'Sign in'
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
                <small>Forgot password? </small>
                <Link to="/recover-password" className="small font-weight-bold">
                  Recover password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default QuickLogin
