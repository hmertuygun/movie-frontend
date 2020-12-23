import React, { useState, useContext } from 'react'
import { Logo, Icon } from '../../components'
import { UserContext } from '../../contexts/UserContext'

const QuickLoginVerify2FA = () => {
  const { verify2FA } = useContext(UserContext)
  const [t2faToken, set2faToken] = useState('')
  const [error, setError] = useState('')

  const doVerify2FA = async (t2faToken) => {
    const isVerifed = await verify2FA(t2faToken)
    if (!isVerifed) {
      setError({ message: "Provided 2FA Token doesn't match." })
    }
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
                    setError({
                      message:
                        'You need to provide a valid Two Factor Authentication token',
                    })
                  }
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
                      onChange={(event) => set2faToken(event.target.value)}
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
                    Verify
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
