import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { createGoogleAuth2FA, saveGoogleAuth2FA } from '../../api/api'
import { UserContext } from '../../contexts/UserContext'

const HeaderSteps = [{ title: 'Download App', step: 1 }, { title: 'Scan QR Code', step: 2 }, { title: 'Enabled Google authenticator', step: 3 }, { title: 'Backup Key', step: 4 }]
const HeaderStep = ({ step: active }) => (
  <div className="row justify-content-center">
    {HeaderSteps.map(({ title, step }) => (
      <div key={step} className="mx-2">
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
      {
        step < ADD_2FA_FLOW.length ?
          (
            <div className="card-header">
              <HeaderStep step={step} />
            </div>
          ) : null
      }
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
  const [googleAuth2FARequest, setGoogleAuth2FARequest] = useState()

  useEffect(() => {
    const request = createGoogleAuth2FA()
    setGoogleAuth2FARequest(request)
  }, [])
  const generateSecret = async () => {
    const googleAuth2FA = await googleAuth2FARequest
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
export const ScanQRCode = withCard(1, ({ onNext, data }) => {
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
  onNext.current = () => data
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
export const EnableGoogleAuth = withCard(2, ({ onNext, new2FADetails, data }) => {
  const [verifyCode, setVerifyCode] = useState('')
  const handleUserInput = (e) => setVerifyCode(e.target.value)
  const verifyAppAuthCode = async () => {
    // console.log('new2FADetails', new2FADetails)
    const response = await saveGoogleAuth2FA({
      auth_answer: verifyCode,
      key: data.key,
      title: new2FADetails.title,
      description: new2FADetails.description,
      date: new2FADetails.date,
      type: new2FADetails.type,
    })
    return response.data
  }
  onNext.current = verifyAppAuthCode
  return (
    <div>
      <h5 className="h6 mb-4">Enable Google Authenticator</h5>
      <input
        type="text"
        className="form-control"
        placeholder="Enter Google verification code"
        value={verifyCode}
        onChange={handleUserInput}
      />
      <p className="text-sm mt-4">
        Enter the 6 digit code from Google Authenticator.
      </p>
    </div>
  )
})
export const BackUpKey = withCard(3, ({ data }) => {
  return (
    <>
      <h4 className="text-center">Please save this keys. They will allow you to recover your 2FA in case of phone loss.</h4>
      <div className="mt-4">
        {
          data.backup_codes.map(code => (
            <>
              <p className="text-center">{code}</p>
            </>
          ))
        }
      </div>
    </>
  )
})

export const DeleteGoogleAuth = withCard(4, ({ onNext }) => {
  const { delete2FA } = useContext(UserContext)
  const [verifyCode, setVerifyCode] = useState('')
  const handleUserInput = (e) => setVerifyCode(e.target.value)
  const deleteAppAuthCode = async () => {
    await delete2FA(verifyCode)
  }
  onNext.current = deleteAppAuthCode
  return (
    <div className="row col-12">
      <h5 className="h6 mb-0">Delete Google Authenticator</h5>
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

export const ADD_2FA_FLOW = [DownloadApp, ScanQRCode, EnableGoogleAuth, BackUpKey]