import React, { useContext, useRef, useState } from 'react'
import QRCode from 'qrcode'
import T2FARow from './T2FARow'
import T2FAModal, { BackUpKey, DownloadApp, EnableGoogleAuth, ScanQRCode } from './T2FAModal'
import { createGoogleAuth2FA, saveGoogleAuth2FA } from '../../api/api'
import { UserContext } from '../../contexts/UserContext'
import { Modal } from '../../components'

const T2FA_TYPES = {
  googleAuth: {
    title: 'Google Auth',
    type: 'GOOGLE_AUTH'
  },
}

const ADD_2FA_FLOW = [DownloadApp, ScanQRCode, EnableGoogleAuth, BackUpKey]

const Security = () => {
  const { delete2FA, get2FADetails } = useContext(UserContext)
  const [t2FAList, set2FAList] = useState(() => {
    const t2FAEntry = get2FADetails()
    return t2FAEntry ? [t2FAEntry] : []
  })
  const [desc, setDesc] = useState('')
  const googleAuth2FARef = useRef()
  const [toggleModal, setToggleModal] = useState(false)
  const [T2FASecretCode, setT2FASecretCode] = useState('')
  const [add2FAFlowPage, setAdd2FAFlowPage] = useState(0)
  const nextDataRef = useRef()

  const generate2FASecret = async () => {
    const googleAuth2FA = await createGoogleAuth2FA()
    googleAuth2FARef.current = googleAuth2FA.data
    console.log('GoogleAuth2fa', googleAuth2FA.data)
    const otpauth = `otpauth://totp/${googleAuth2FARef.current.label}?secret=${googleAuth2FARef.current.secret}`
    QRCode.toDataURL(otpauth, function (err, data_url) {
      setT2FASecretCode(data_url)
      setToggleModal(true)
    })
  }

  const handleEntryRemove = (entry) => async () => {
    setT2FASecretCode(null)
    setToggleModal(true)
  }

  const closeModal = () => setToggleModal(false)
  const verifyAppAuthCode = async (userToken) => {
    try {
      if (T2FASecretCode) {
        const new2FAEntry = {
          title: T2FA_TYPES.googleAuth.title,
          description: desc,
          date: new Date().getTime(),
          type: T2FA_TYPES.googleAuth.type
        }
        await saveGoogleAuth2FA({
          auth_answer: userToken,
          key: googleAuth2FARef.current.key,
          title: new2FAEntry.title,
          description: new2FAEntry.description,
          date: new2FAEntry.date,
          type: new2FAEntry.type,
        })
        set2FAList([...t2FAList, new2FAEntry])
        setDesc('')
      } else {
        await delete2FA(userToken)
        // For now it's only one kind of 2FA
        set2FAList([])
      }
      closeModal()
    } catch (error) {
      /*
      TODO 2FA: ADD Alert ERROR Message
      ErrorAlertNotificaton({
        title: '2FA Verification',
        message: "Provided token doesn't match",
      })

      */
    }
  }

  const T2FAContent = ADD_2FA_FLOW[add2FAFlowPage]


  return (
    <div className="slice slice-sm bg-section-secondary">
      {
        toggleModal ? (
          <Modal onClose={closeModal}>
            <T2FAContent next={(data) => {
              const next = add2FAFlowPage + 1
              if (next < ADD_2FA_FLOW.length) {
                nextDataRef.current = data
                setAdd2FAFlowPage(next)
              } else {
                setAdd2FAFlowPage(0)
                closeModal()
              }
            }} onReset={closeModal} {...{ data: nextDataRef.current }} />
          </Modal>
        ) : null
      }
      <div className="slice slice-sm bg-section-secondary">
        <div className="justify-content-center">
          <div className="row">
            <div className="col-lg-12">
              <div className="mb-5">
                <div className="card">
                  <div className="card-header">
                    <h5 className="h6 mb-0">Two Factor Authentication</h5>
                    <p className="text-sm mb-0">
                      Keep your account secure by enabling two-factor
                      authentication.
                    </p>
                  </div>
                  <ul className="list-group list-group-flush">
                    <Select2FAType
                      desc={desc}
                      setDesc={setDesc}
                      onAddNew={() => setToggleModal(true)}
                    />
                    {t2FAList &&
                      t2FAList.length > 0 &&
                      t2FAList.map((entry) => (
                        <T2FARow
                          key={entry.date}
                          {...entry}
                          onRemove={handleEntryRemove(entry)}
                        />
                      ))}
                  </ul>
                </div>
              </div>
              {/* CHANGE PASSWORD */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Security

const AddButton = ({ onClick }) => {
  return (
    <button type="button" className="btn btn-secondary px-3" onClick={onClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="feather feather-plus"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  )
}

const Select2FAType = ({ desc, setDesc, onAddNew }) => {
  return (
    <li className="list-group-item">
      <div className="row mx-n2">
        <div className="col-12 col-lg-4 px-2">
          <div className="form-group">
            <select className="custom-select" disabled>
              <option>{T2FA_TYPES.googleAuth.title}</option>
            </select>
          </div>
        </div>
        <div className="col col-lg px-2">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>
        <div className="col-auto px-2">
          <AddButton onClick={onAddNew} />
        </div>
      </div>
    </li>
  )
}
