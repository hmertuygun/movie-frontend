import React from 'react'
import { UserCheck } from 'react-feather'
import { Modal } from 'components'

const SubscriptionCancel = ({ handleSuccess, isLoading, handleCancel }) => {
  return (
    <Modal>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body">
            <div className="pt-5 text-center">
              <div className="icon text-danger custom-icon-container">
                <UserCheck size={16} strokeWidth={3} />
              </div>
              <h4 className="h5 mt-5 mb-3">
                Do you want to cancel your current subscription?
              </h4>
              <p>
                Your subscription will be cancelled immediately. You will be
                able to use CoinPanel until expiration date. Don't worry, you
                can subscribe again later.
              </p>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-sm btn-link text-danger btn-zoom--hover font-weight-600"
              onClick={handleSuccess}
            >
              {isLoading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                'Cancel Subscription'
              )}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={handleCancel}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default SubscriptionCancel
