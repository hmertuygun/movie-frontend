import React from 'react'
import { Modal } from 'components'
import { UserCheck } from 'react-feather'

const EndTrialModal = ({ handleClickYes, handleClickCancel, isLoading }) => {
  return (
    <Modal>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body">
            <div className="pt-5 text-center">
              <div className="icon text-warning custom-icon-container">
                <UserCheck size={16} strokeWidth={3} />
              </div>
              <h4 className="h5 mt-5 mb-3">Extremely important</h4>
              <p>
                You will be ended your trial and paid features will be activated
                for your account. Are you sure?
              </p>
            </div>
          </div>
          <div className="modal-footer">
            <button
              onClick={handleClickYes}
              type="button"
              className="btn btn-sm btn-link text-warning btn-zoom--hover font-weight-600"
            >
              {isLoading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                'Yes'
              )}
            </button>
            <button
              type="button"
              className="btn btn-sm "
              onClick={handleClickCancel}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default EndTrialModal
