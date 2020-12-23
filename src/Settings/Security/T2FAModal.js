import React, { useEffect, useState } from 'react'
import { Modal } from '../../components'

const T2FAModal = ({
  visible,
  closeModal,
  T2FASecretCode,
  verifyAppAuthCode,
}) => {
  const [verifyCode, setVerifyCode] = useState('')

  const handleUserInput = (e) => setVerifyCode(e.target.value)
  const handleSubmit = () => verifyAppAuthCode(verifyCode)

  useEffect(() => {
    if (!visible) {
      setVerifyCode('')
    }
  }, [visible])

  if (!visible) return null
  return (
    <Modal onClose={closeModal}>
      <div className="card">
        <div className="card-header">
          <h5 className="h6 mb-0">Google Authenticator</h5>
          <p className="text-sm mb-0">
            Scan QRCode with Google Authenticator APP
          </p>
          <div className="row justify-content-center">
            <img
              src={T2FASecretCode}
              alt="2FA Secret Code for Google Auth APP"
            />
          </div>
        </div>
        <div className="card-body">
          <input
            type="text"
            className="form-control"
            placeholder="Enter APP Code"
            value={verifyCode}
            onChange={handleUserInput}
          />
        </div>
        <div className="card-footer">
          <div className="row">
            <div className="col-6">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSubmit}
              >
                Verify
              </button>
            </div>
            <div className="col-6 text-right">
              <button
                type="button"
                className="btn btn-danger"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default T2FAModal
