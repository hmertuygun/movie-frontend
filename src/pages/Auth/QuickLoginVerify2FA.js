import React, { useState, useContext } from 'react'
import { Redirect } from 'react-router-dom'
import { Logo, Icon } from 'components'
import { UserContext } from 'contexts/UserContext'
import { useDispatch, useSelector } from 'react-redux'
import { logout, verify2FA } from 'store/actions'
import MESSAGES from 'constants/Messages'

const QuickLoginVerify2FA = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { isLoggedInWithFirebase } = useContext(UserContext)
  const [t2faToken, set2faToken] = useState('')
  const [error, setError] = useState('')
  const { userState } = useSelector((state) => state.users)
  const dispatch = useDispatch()
  const doVerify2FA = async (t2faToken) => {
    try {
      setIsLoading(true)
      const isVerified = await dispatch(verify2FA(t2faToken, userState))
      if (!isVerified) {
        setError(MESSAGES['2fa-not-matching'])
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoggedInWithFirebase) {
    return <Redirect to="/login" />
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
                <h6 className="h4 mb-1">Two Factor Authentication</h6>
              </div>
              <span className="clearfix"></span>
              <form
                onSubmit={(event) => {
                  event.preventDefault()

                  if (t2faToken) {
                    doVerify2FA(t2faToken)
                  } else {
                    setError(
                      'You need to provide a valid Two Factor Authentication token'
                    )
                  }
                }}
                onReset={() => {
                  dispatch(logout())
                }}
              >
                <div className="form-group">
                  <label className="form-control-label">Generated token</label>
                  <div className="input-group input-group-merge">
                    <input
                      type="number"
                      className="form-control form-control-prepend"
                      id="input-2fa"
                      placeholder="123456"
                      value={t2faToken}
                      onChange={(event) => {
                        setError('')
                        set2faToken(event.target.value)
                      }}
                    />
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <Icon icon="key" />
                      </span>
                    </div>
                  </div>
                </div>
                {error && <p className="text-sm mt-3 text-danger">{error}</p>}
                <div className="mt-4">
                  <button
                    type="submit"
                    className="btn btn-block btn-primary d-flex align-items-center justify-content-center"
                    disabled={isLoading}
                  >
                    Verify
                    {isLoading ? (
                      <span
                        className="ml-2 spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    ) : null}
                  </button>
                </div>
                <div className="mt-4">
                  <button type="reset" className="btn btn-block btn-danger">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default QuickLoginVerify2FA
