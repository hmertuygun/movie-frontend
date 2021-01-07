import React, { useState, useEffect, useContext } from 'react'
import { Link, Redirect } from 'react-router-dom'
import { Logo, Icon } from '../../components'
import { UserContext } from '../../contexts/UserContext'

const QuickLogin = () => {
  const { login, isLoggedInWithFirebase } = useContext(UserContext)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [type, setType] = useState('password')

  // clear errors
  useEffect(() => {
    setError('')
  }, [email, password])

  const doLogin = async () => {
    const loggedin = await login(email, password)
    if (loggedin.message) {
      setError({ message: loggedin.message })
    }
  }

  const toggleTypeText = () => {
    if (type === 'text') {
      setType('password')
    } else {
      setType('text')
    }
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
                    doLogin(email, password)
                  } else {
                    setError({
                      message: 'You need both email and password to sign in',
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
                  <button type="submit" className="btn btn-block btn-primary">
                    Sign in
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <small>Not registered? </small>
                <Link to="/register" className="small font-weight-bold">
                  Create account
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
