import React, { useState } from 'react'

const AddWatchListModal = ({ onClose, onSave, isLoading }) => {
  const [watchListName, setWatchListName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!watchListName) {
      setError('Name is required.')
    }

    onSave({ watchListName })
  }
  return (
    <div className="modal-open">
      <div
        className="modal fade show"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-modal="true"
        style={{ display: 'block' }}
      >
        <form
          className="modal-dialog modal-dialog-centered modal-sm"
          onSubmit={handleSubmit}
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
                    disabled={isLoading}
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
              <button
                disabled={isLoading}
                type="submit"
                className="btn btn-primary"
              >
                {!isLoading ? (
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
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  )
}

export default AddWatchListModal
