import React, { useState } from 'react'
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

  return (
    visible && (
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
          <input
            type="text"
            className="form-control"
            placeholder="Enter APP Code"
            value={verifyCode}
            onChange={handleUserInput}
          />
          <button
            type="button"
            className="btn btn-secondary px-3"
            onClick={handleSubmit}
          >
            Verify
          </button>
          <button
            type="button"
            className="btn btn-danger px-3"
            onClick={closeModal}
          >
            Cancel
          </button>
        </div>
      </Modal>
    )
  )
}

export default T2FAModal
