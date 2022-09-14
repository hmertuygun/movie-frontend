import React from 'react'
import PropTypes from 'prop-types'

const DeletionModal = ({ onClose, onDelete, isLoading }) => {
  return (
    <div className="modal-open">
      <div
        className="modal fade show"
        role="dialog"
        aria-labelledby="modal_account_deactivate"
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-body">
              <div className=" text-center">
                <h4 className="h5 mt-5 mb-3">
                  Exchange integration deletion confirmation
                </h4>
                <p>
                  Your exchange account will be disconnected from CoinPanel and
                  all your open orders on CoinPanel will be cancelled. Your open
                  orders on the exchange will not be affected. This action can
                  not be undone. Are you sure you want to do this?
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                disabled={isLoading}
                type="button"
                className="btn btn-sm btn-link text-danger btn-zoom--hover font-weight-600"
                onClick={onDelete}
              >
                {!isLoading ? (
                  'Delete'
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
                className="btn btn-sm btn-secondary"
                data-dismiss="modal"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  )
}

DeletionModal.propTypes = {
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
  isLoading: PropTypes.bool,
}

export default DeletionModal
