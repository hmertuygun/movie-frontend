import React, { useContext, useRef, useState } from 'react'
import T2FARow from './T2FARow'
import { ADD_2FA_FLOW, DeleteGoogleAuth, ModalsConf } from './T2FAModal'
import { UserContext } from '../../contexts/UserContext'
import { Modal } from '../../components'

const T2FA_TYPES = {
  googleAuth: {
    title: 'Google Auth',
    type: 'GOOGLE_AUTH'
  },
}

const Security = () => {
  const { get2FADetails } = useContext(UserContext)
  const [t2FAList, set2FAList] = useState(() => {
    const t2FAEntry = get2FADetails()
    return t2FAEntry ? [t2FAEntry] : []
  })
  const [desc, setDesc] = useState('')
  const [toggleModal, setToggleModal] = useState(false)
  const [add2FAFlowPage, setAdd2FAFlowPage] = useState(0)
  const nextDataRef = useRef()

  const handleEntryRemove = () => {
    setAdd2FAFlowPage(ADD_2FA_FLOW.length)
    setToggleModal(true)
  }

  const closeModal = () => setToggleModal(false)

  const T2FAContent = add2FAFlowPage < ADD_2FA_FLOW.length ? ADD_2FA_FLOW[add2FAFlowPage] : DeleteGoogleAuth

  const reset2FAFlow = () => {
    setAdd2FAFlowPage(0)
    closeModal()
  }

  const new2FAEntry = {
    title: T2FA_TYPES.googleAuth.title,
    description: desc,
    date: new Date().getTime(),
    type: T2FA_TYPES.googleAuth.type
  }

  return (
    <div className="slice slice-sm bg-section-secondary">
      {
        toggleModal ? (
          <Modal onClose={reset2FAFlow}>
            <T2FAContent
              new2FADetails={new2FAEntry}
              next={(data) => {
                const next = add2FAFlowPage + 1
                if (next < ADD_2FA_FLOW.length) {
                  nextDataRef.current = data
                  if (next === ModalsConf.BackUpKey.step) {
                    set2FAList([...t2FAList, new2FAEntry])
                    setDesc('')
                  }
                  setAdd2FAFlowPage(next)
                } else {
                  if (add2FAFlowPage === ADD_2FA_FLOW.length) {
                    set2FAList([])
                  }
                  reset2FAFlow()
                }
              }}
              onBack={() => {
                const prev = add2FAFlowPage - 1
                if (add2FAFlowPage > 0) {
                  setAdd2FAFlowPage(prev)
                }
              }}
              onReset={closeModal}
              {...{ data: nextDataRef.current }}
            />
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
                      disabled={t2FAList.length > 0}
                    />
                    {t2FAList &&
                      t2FAList.length > 0 &&
                      t2FAList.map((entry) => (
                        <T2FARow
                          key={entry.date}
                          {...entry}
                          onRemove={handleEntryRemove}
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

const AddButton = ({ disabled, onClick }) => {
  return (
    <button disabled={disabled} type="button" className="btn btn-secondary px-3" onClick={onClick}>
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

const Select2FAType = ({ desc, setDesc, onAddNew, disabled }) => {
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
          <AddButton onClick={onAddNew} disabled={disabled} />
        </div>
      </div>
    </li>
  )
}
