import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { X } from 'react-feather'
import { Icon, Modal } from 'components'
import { verify2FA, updateShow2FAModal } from 'store/actions'
import MESSAGES from 'constants/Messages'

const Auth2FAModal = ({ setShow2FAModal }) => {
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
          <div className="modal-body position-relative">
            <div>
              <h5>You need to enter your 2FA to keep trading</h5>

              <X
                size={18}
                onClick={() => dispatch(updateShow2FAModal(false))}
                className="position-absolute top-2 right-2 masonry-filter"
              />
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault()

                if (t2faToken) {
                  doVerify2FA(t2faToken)
                } else {
                  setError(MESSAGES['invalid-2fa'])
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
