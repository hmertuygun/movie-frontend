import React from 'react'
import PropTypes from 'prop-types'
import { UserCheck } from 'react-feather'
import { Modal } from 'components'
import ReasoningModal from 'pages/Settings/Security/ReasoningModal'

const SubscriptionCancel = ({
  handleSuccess,
  isLoading,
  handleCancel,
  handleChange,
  showInfo,
}) => {
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
              {showInfo && (
                <p>
                  Your subscription will be cancelled immediately. You will be
                  able to use CoinPanel until expiration date. Don't worry, you
                  can subscribe again later.
                </p>
              )}
            </div>
            <ReasoningModal onChange={(data) => handleChange(data)} />
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

SubscriptionCancel.propTypes = {
  handleSuccess: PropTypes.func,
  isLoading: PropTypes.bool,
  handleCancel: PropTypes.func,
  handleChange: PropTypes.func,
  showInfo: PropTypes.bool,
}

export default SubscriptionCancel
