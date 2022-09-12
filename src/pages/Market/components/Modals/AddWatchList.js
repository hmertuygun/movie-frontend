import React, { useState } from 'react'
import { Modal } from 'components'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { saveWatchList } from 'store/actions'
import { notify } from 'reapop'
import MESSAGES from 'constants/Messages'

const AddWatchList = ({ onClose }) => {
  const [watchListName, setWatchListName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const dispatch = useDispatch()

  const saveNewWatchlist = (ele) => {
    ele.preventDefault()
    if (!watchListName) {
      setError('Name is required.')
      return
    }
    setSaving(true)
    try {
      let data = {
        lists: {
          [watchListName]: { watchListName },
        },
      }
      dispatch(saveWatchList(data)).then(() => {
        dispatch(notify(MESSAGES['watchlist-created'], 'success'))
        onClose()
      })
    } catch (error) {
      dispatch(notify(MESSAGES['watchlist-failed'], 'error'))
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal>
      <form
        className="modal-dialog modal-dialog-centered modal-sm"
        onSubmit={saveNewWatchlist}
      >
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-title">Create new list</div>
            <button
              onClick={onClose}
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span className="modal-cross" aria-hidden="true">
                &times;
              </span>
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">Name</span>
                </div>
                <input
                  type="text"
                  disabled={saving}
                  className="form-control"
                  name="watchListName"
                  value={watchListName}
                  onChange={(event) => {
                    setWatchListName(event.target.value)
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: '5px',
                  color: 'var(--trade-text-danger-color)',
                }}
              >
                {error}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button disabled={saving} type="submit" className="btn btn-primary">
              {!saving ? (
                'Create'
              ) : (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

AddWatchList.propTypes = {
  onClose: PropTypes.func,
}

export default AddWatchList
