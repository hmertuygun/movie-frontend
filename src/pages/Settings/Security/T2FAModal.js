import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { createGoogleAuth2FA } from 'services/api'
import { ModalsConf } from 'constants/ModalsConf'
import { useLocation, useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { updateTwofaSecretKey, delete2FA, add2FA } from 'store/actions'

const HeaderSteps = [
  ModalsConf.DownloadApp,
  ModalsConf.ScanQRCode,
  ModalsConf.EnableGoogleAuth,
  ModalsConf.BackUpKey,
]
const HeaderStep = ({ step: active, isMobile }) => {
  let currentStepTitle = HeaderSteps.find((step) => step.step === active)?.title
  return (
    <div className="row justify-content-center px-3 mt-3">
      {isMobile ? (
        <div className="text-center">
          <h2>{currentStepTitle}</h2>
        </div>
      ) : (
        <>
          {HeaderSteps.map(({ title, step }) => (
            <div key={step} className="mx-2">
              <span
                className={`badge badge-md ${
                  active === step ? 'bg-primary text-white' : 'bg-secondary'
                }`}
              >
                {title}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

const withCard =
  (step = ModalsConf.DownloadApp.step, ReactNode, hasPrev) =>
  ({ next, onBack, ...props }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    const { hash } = useLocation()
    const history = useHistory()
    const { userState } = useSelector((state) => state.users)
    const onNext = useRef()
    const onClickNext = async () => {
      try {
        setIsLoading(true)
        if (typeof onNext.current === 'function') {
          const data = await onNext.current()
          next(data)
        } else {
          if (hash === '#security' || userState.has2FADetails) {
            history.push('/trade')
            next()
          } else {
            next()
          }
        }
      } catch (error) {
        throw error
      } finally {
        setIsLoading(false)
      }
    }

    const detectWidthSize = () => {
      setWindowWidth(window.innerWidth)
    }

    useEffect(() => {
      window.addEventListener('resize', detectWidthSize)

      return () => {
        window.removeEventListener('resize', detectWidthSize)
      }
    }, [windowWidth])

    let isMobile = windowWidth <= 767
    return (
      <div className="card container">
        {step < ADD_2FA_FLOW.length ? (
          <div className="card-header">
            <HeaderStep step={step} isMobile={isMobile} />
          </div>
        ) : null}
        <div className="card-body d-flex flex-column justify-content-center">
          <ReactNode {...props} onNext={onNext} isMobile={isMobile} />
        </div>
        <div className="card-footer">
          <div className="row">
            <div className="col-12 d-flex justify-content-center">
              {hasPrev && (
                <button type="button" className="btn" onClick={onBack}>
                  {'<'} Prev
                </button>
              )}
              <button
                type="button"
                className="d-flex btn btn-primary align-items-center"
                onClick={onClickNext}
                disabled={isLoading}
              >
                {step < ADD_2FA_FLOW.length - 1 ? 'Next' : 'Complete'}
                {isLoading ? (
                  <span
                    className="ml-2 spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

export const DownloadApp = withCard(
  0,
  ({ onNext, isMobile }) => {
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
        <p className="text-center">
          Download and install the Google Authenticator app
        </p>
        <div
          className={`row justify-content-center ${
            isMobile ? 'flex-column' : ''
          }`}
        >
          <a
            id="enableGA_a_appStore"
            href="https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8"
            target="_blank"
            rel="noreferrer noopener"
            className={`row justify-content-center align-items-center border mx-2 pt-2 pb-2 ${
              isMobile ? 'col-12 mb-2' : 'col-5'
            }`}
          >
            <img
              src="img/brand/apple.svg"
              className="col-3"
              alt="Apple Store Logo"
            />
            <div className="col-6">
              <div className="text-dark">Download from</div>
              <div className="text-dark">App Store</div>
            </div>
          </a>
          <div className="mr-4" />
          <a
            id="enableGA_a_googlePlay"
            href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
            target="_blank"
            rel="noreferrer noopener"
            className={`row justify-content-center border mx-2 pt-2 p-4 ${
              isMobile ? 'col-12' : 'col-5'
            }`}
          >
            <img
              src="img/brand/google-play-colors.svg"
              className="col-3"
              alt="Google Play Store logo"
            />
            <div>
              <div className="text-dark">Download from</div>
              <div className="text-dark">Google Play</div>
            </div>
          </a>
        </div>
      </>
    )
  },
  ModalsConf.DownloadApp.hasBack
)

export const ScanQRCode = withCard(
  ModalsConf.ScanQRCode.step,
  ({ onNext, data }) => {
    const [t2FASecretCode, setT2FASecretCode] = useState('')
    const dispatch = useDispatch()
    useEffect(() => {
      const generateSecret = async () => {
        const otpauth = `otpauth://totp/${data.label}?secret=${data.secret}`
        QRCode.toDataURL(otpauth, function (err, data_url) {
          setT2FASecretCode(data_url)
          dispatch(updateTwofaSecretKey(data.secret))
        })
      }
      generateSecret()
    }, [data.label, data.secret])
    onNext.current = () => data
    return (
      <>
        {t2FASecretCode ? (
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
              If you are unable to scan the QR code, please enter this code
              manually into the app.
            </p>
            <p className="text-center">{data.secret}</p>
          </>
        ) : null}
      </>
    )
  },
  ModalsConf.ScanQRCode.hasBack
)

const CodeForm = ({ title, onVerify, onNext, onChangeCode }) => {
  const [error, setError] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const handleUserInput = (e) => {
    const value = e.target.value
    setVerifyCode(value)
    onChangeCode && onChangeCode(value)
    setError('')
  }
  const verify = async () => {
    try {
      const response = await onVerify()
      return response
    } catch (error) {
      setError({ message: "Provided 2FA Token doesn't match." })
      throw error
    }
  }
  onNext.current = verify
  return (
    <div>
      <h5 className="h6 mb-4">{title}</h5>
      <input
        type="text"
        className="form-control"
        placeholder="Enter Google verification code"
        value={verifyCode}
        onChange={handleUserInput}
      />
      {error && <p className="text-sm mt-1 text-danger">{error.message}</p>}
      <p className="text-sm mt-4">
        Enter the 6 digit code from Google Authenticator.
      </p>
    </div>
  )
}
export const EnableGoogleAuth = withCard(
  ModalsConf.EnableGoogleAuth.step,
  ({ onNext, new2FADetails, data }) => {
    const { userState } = useSelector((state) => state.users)
    const dispatch = useDispatch()
    const [verifyCode, setVerifyCode] = useState('')
    const verifyAppAuthCode = async () => {
      const response = await dispatch(
        add2FA(
          {
            auth_answer: verifyCode,
            key: data.key,
            title: new2FADetails.title,
            description: new2FADetails.description,
            date: new2FADetails.date,
            type: new2FADetails.type,
          },
          userState
        )
      )
      return response
    }
    return (
      <CodeForm
        title="Enable Google Authenticator"
        onVerify={verifyAppAuthCode}
        onNext={onNext}
        onChangeCode={setVerifyCode}
      />
    )
  },
  ModalsConf.EnableGoogleAuth.hasBack
)

export const BackUpKey = withCard(
  ModalsConf.BackUpKey.step,
  ({ data }) => {
    const { twofaSecretKey } = useSelector((state) => state.appFlow)
    return (
      <>
        <h4 className="text-center">
          Please save this setup key. They will allow you to recover your 2FA in
          in the event of device loss.
        </h4>
        <div className="mt-4">
          <h3 className="text-center">{twofaSecretKey}</h3>
        </div>
      </>
    )
  },
  ModalsConf.BackUpKey.hasBack
)

export const DeleteGoogleAuth = withCard(
  ModalsConf.DeleteGoogleAuth.step,
  ({ onNext }) => {
    const dispatch = useDispatch()
    const { userState } = useSelector((state) => state.users)
    const [verifyCode, setVerifyCode] = useState('')
    const deleteAppAuthCode = async () => {
      await dispatch(delete2FA(verifyCode, userState))
    }
    return (
      <CodeForm
        title="Delete Google Authenticator"
        onVerify={deleteAppAuthCode}
        onNext={onNext}
        onChangeCode={setVerifyCode}
      />
    )
  },
  ModalsConf.DeleteGoogleAuth.hasBack
)

export const ADD_2FA_FLOW = [
  DownloadApp,
  ScanQRCode,
  EnableGoogleAuth,
  BackUpKey,
]
