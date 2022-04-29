import React, { useContext, useRef, useState, useMemo } from 'react'
import { X } from 'react-feather'
import { useNotifications } from 'reapop'
import T2FARow from './T2FARow'
import { ADD_2FA_FLOW, DeleteGoogleAuth } from './T2FAModal'
import { UserContext } from 'contexts/UserContext'
import { Modal, Button } from 'components'
import { UserX, AlertTriangle } from 'react-feather'
import { deleteUserAccount } from 'services/api'
import { useHistory, useLocation } from 'react-router-dom'
import { ModalsConf } from 'constants/ModalsConf'
import { T2FA_TYPES } from 'constants/Security'

const Security = () => {
  const { get2FADetails, state } = useContext(UserContext)
  const { notify } = useNotifications()

  const [t2FAList, set2FAList] = useState(() => {
    const t2FAEntry = get2FADetails()
    return t2FAEntry ? [t2FAEntry] : []
  })
  const [desc, setDesc] = useState('')
  const [toggleModal, setToggleModal] = useState(false)
  const [add2FAFlowPage, setAdd2FAFlowPage] = useState(0)
  const [accountDeleteLoading, setAccountDeleteLoading] = useState(false)
  const [showAccountDeleteModal, setShowAccountDeleteModal] = useState(false)
  const nextDataRef = useRef()

  const history = useHistory()
  const { hash } = useLocation()

  const handleEntryRemove = () => {
    setAdd2FAFlowPage(ADD_2FA_FLOW.length)
    setToggleModal(true)
  }

  const closeModal = () => setToggleModal(false)

  const T2FAContent = useMemo(
    () =>
      add2FAFlowPage < ADD_2FA_FLOW.length
        ? ADD_2FA_FLOW[add2FAFlowPage]
        : DeleteGoogleAuth,
    [add2FAFlowPage, add2FAFlowPage]
  )

  const reset2FAFlow = () => {
    setAdd2FAFlowPage(0)
    closeModal()
  }

  const new2FAEntry = useMemo(() => {
    return {
      title: T2FA_TYPES.googleAuth.title,
      description: desc,
      date: new Date().getTime(),
      type: T2FA_TYPES.googleAuth.type,
    }
  }, [T2FA_TYPES, desc])

  const handleDeleteAccount = async () => {
    setAccountDeleteLoading(true)
    try {
      await deleteUserAccount()
      setAccountDeleteLoading(false)
      history.push('/logout')
    } catch (err) {
      setAccountDeleteLoading(false)
      notify({
        status: 'error',
        title: 'Error',
        message: 'It seems something wrong. Please try again later!',
      })
    }
  }

  return (
    <div className="slice slice-sm bg-section-secondary">
      {hash === '#security' || !state.has2FADetails ? (
        <div
          className="alert alert-group alert-outline-warning alert-dismissible fade show alert-icon mb-0"
          role="alert"
        >
          <div className="alert-group-prepend">
            <span className="alert-group-icon text-">
              <AlertTriangle size={16} strokeWidth={3} />
            </span>
          </div>
          <div className="alert-content">
            <strong>Important!</strong> At CoinPanel we are all about security.
            That's you must now activate 2FA login on CoinPanel in order to
            continue trading - stay safe.
          </div>
        </div>
      ) : null}
      {toggleModal ? (
        <Modal onClose={reset2FAFlow}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: '1',
              }}
            >
              <Button onClick={reset2FAFlow} remove>
                <X size="20" />
              </Button>
            </div>
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
          </div>
        </Modal>
      ) : null}
      <div className="slice slice-sm bg-section-secondary">
        <div className="justify-content-center">
          <div className="row">
            <div className="col-lg-12">
              <div className="mb-4 security-border">
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
              <div>
                <div className="page-inner-header mb-4">
                  <h5 className="mb-1">Delete account</h5>
                  <p className="text-muted mb-0">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                </div>
                <div className="row">
                  <div className="col-md-8">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setShowAccountDeleteModal(true)}
                    >
                      Delete your account
                    </button>
                  </div>
                </div>
                {showAccountDeleteModal && (
                  <Modal>
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-body">
                          <div className="pt-5 text-center">
                            <div className="icon text-danger custom-icon-container">
                              <UserX size={16} strokeWidth={3} />
                            </div>
                            <h4 className="h5 mt-5 mb-3">
                              Extremely important
                            </h4>
                            <p>
                              We will immediately delete all of your personal
                              data from our database. This action can not be
                              undone. Are you sure you want to do this?
                            </p>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button
                            onClick={handleDeleteAccount}
                            type="button"
                            className="btn btn-sm btn-link text-danger btn-zoom--hover font-weight-600"
                          >
                            {accountDeleteLoading ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                              />
                            ) : (
                              'Delete'
                            )}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => setShowAccountDeleteModal(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </Modal>
                )}
              </div>
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
    <button
      disabled={disabled}
      type="button"
      className="btn btn-secondary px-3"
      onClick={onClick}
    >
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
  const [error, setError] = useState('')
  const handleAddNew = () => {
    if (disabled) {
      setError('You already have Google Authenticator for 2FA.')
    } else {
      onAddNew && onAddNew()
    }
  }
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
          <AddButton onClick={handleAddNew} />
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </li>
  )
}
