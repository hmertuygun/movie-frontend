import React, { lazy, useContext, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { UserContext } from 'contexts/UserContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector, useDispatch } from 'react-redux'
import { updateShowSubModal, verify2FA } from 'store/actions'

import { Icon, Modal } from 'components'

const Auth2FAModal = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [t2faToken, set2faToken] = useState('')
  const [error, setError] = useState('')
  const { userState } = useSelector((state) => state.users)
  const dispatch = useDispatch()
  const doVerify2FA = async (t2faToken) => {
    try {
      setIsLoading(true)
      const isVerified = await dispatch(verify2FA(t2faToken, userState))
      if (!isVerified) {
        setError("Provided 2FA Token doesn't match.")
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body">
            <h5>You need to enter your 2FA to keep trading</h5>
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
            </form>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default Auth2FAModal
