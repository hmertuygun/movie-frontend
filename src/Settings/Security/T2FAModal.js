import React, { useCallback, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { createGoogleAuth2FA } from '../../api/api'

const HeaderSteps = [{ title: 'Download App', step: 1 }, { title: 'Scan QR Code', step: 2 }, { title: 'Backup Key', step: 3 }, { title: 'Enabled Google authenticator', step: 4 }]
const HeaderStep = ({ step: active }) => (
  <div className="row justify-content-center">
    {HeaderSteps.map(({ title, step }) => (
      <div className="mx-2">
        <span className={`badge rounded-pill ${active + 1 === step ? 'bg-primary text-white' : 'bg-secondary'}`}>{title}</span>
      </div>
    ))}
  </div>
)

const withCard = (step = 0, ReactNode) => ({ next, ...props }) => {
  const onNext = useRef()
  const onClickNext = async () => {
    if (typeof onNext.current === 'function') {
      const data = await onNext.current()
      next(data)
    } else {
      next()
    }
  }
  return (
    <div className="card" style={{ width: 800, height: 600 }}>
      <div className="card-header">
        <HeaderStep step={step} />
      </div>
      <div className="card-body d-flex flex-column justify-content-center">
        <ReactNode {...props} onNext={onNext} />
      </div>
      <div className="card-footer">
        <div className="row">
          <div className="col-12 d-flex justify-content-center">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClickNext}
            >
              Next
          </button>
          </div>
        </div>
      </div>
    </div >
  )
}

export const DownloadApp = withCard(0, ({ onNext }) => {
  const generateSecret = async () => {
    const googleAuth2FA = await createGoogleAuth2FA()
    return googleAuth2FA.data
  }
  onNext.current = generateSecret
  return (
    <>
      <h1 className="text-center">Step 1</h1>
      <p className="text-center">Download and install the Google Authenticator app</p>
      <div className="row justify-content-center">
        <a id="enableGA_a_appStore" href="https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8" target="_blank" rel="noreferrer noopener" className="row justify-content-center align-items-center border mx-2 pt-2 pb-2">
          <img src="img/icons/brands/apple.svg" className="col-3" />
          <div className="col-6" >
            <div className="text-dark">Download from</div>
            <div className="text-dark">App Store</div>
          </div>
        </a>
        <div className="mr-4" />
        <a id="enableGA_a_googlePlay" href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" rel="noreferrer noopener" className="row justify-content-center border mx-2 pt-2 pb-2">
          <img src="img/icons/brands/google-play-colors.svg" className="col-3" />
          <div >
            <div className="text-dark">Download from</div>
            <div className="text-dark">Google Play</div>
          </div>
        </a>
      </div>
    </>
  )
})
export const ScanQRCode = withCard(1, ({ data }) => {
  const [t2FASecretCode, setT2FASecretCode] = useState('')

  useEffect(() => {
    const generateSecret = async () => {
      const otpauth = `otpauth://totp/${data.label}?secret=${data.secret}`
      QRCode.toDataURL(otpauth, function (err, data_url) {
        setT2FASecretCode(data_url)
      })
    }
    generateSecret()
  }, [])
  return (
    <>
      {
        t2FASecretCode ? (
          <>
            <h5 className="h6 mb-0 text-center">Google Authenticator</h5>
            <p className="text-sm mb-0 text-center">
              Scan QRCode with Google Authenticator APP
            </p>
            <div className="row justify-content-center">
              <img
                src={t2FASecretCode}
                alt="2FA Secret Code for Google Auth APP"
              />
            </div>
            <p className="text-sm mb-0 text-center">
              If you are unable to scan the QR code, please enter this code manually into  the app.
            </p>
            <p className="text-center">{data.secret}</p>
          </>
        ) : null
      }
    </>
  )
})
export const BackUpKey = withCard(2, () => {
  return (
    <>
      BackUpKey
    </>
  )
})
export const EnableGoogleAuth = withCard(3, () => {
  const [verifyCode, setVerifyCode] = useState('')
  const handleUserInput = (e) => setVerifyCode(e.target.value)
  return (
    <div className="row col-12">
      <h5 className="h6 mb-0">Enable Google Authenticator</h5>
      <input
        type="text"
        className="form-control"
        placeholder="Enter Google verification code"
        value={verifyCode}
        onChange={handleUserInput}
      />
      <p className="text-sm mb-0">
        Enter the 6 digit code from Google Authenticator.
      </p>
    </div>
  )
})

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
    <div className="card">
      {
        T2FASecretCode ? (
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
        ) : null
      }
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
  )
}

export default T2FAModal
