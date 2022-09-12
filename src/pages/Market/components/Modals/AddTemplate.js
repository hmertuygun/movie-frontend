import React, { useState, useMemo } from 'react'
import capitalize from 'utils/capitalizeFirstLetter'
import { Modal } from 'components'
import PropTypes from 'prop-types'

const AddTemplate = ({ onClose, onSave, name }) => {
  const [templateName, setTemplateName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!templateName) {
      setError('Name is required.')
    }
    onSave({ templateName })
  }

  const editName = useMemo(() => {
    return capitalize(name.replace('_', ' '))
  }, [name])

  return (
    <Modal>
      <form
        className="modal-dialog modal-dialog-centered modal-sm"
        onSubmit={handleSubmit}
      >
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-title">Create: {editName}</div>
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
                  className="form-control"
                  name="watchListName"
                  value={templateName}
                  onChange={(event) => {
                    setTemplateName(event.target.value)
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
            <button type="submit" className="btn btn-primary">
              Create As Template
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

AddTemplate.propTypes = {
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  name: PropTypes.string,
}

export default AddTemplate
