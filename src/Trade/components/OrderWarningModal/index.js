import React from 'react'

const OrderWarningModal = ({ isLoading, onClose, placeOrder }) => {
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
                <h4 className="h5 mt-5 mb-3">Order confirmation</h4>
                <p>
                  This order will execute immediately. Make sure you are not
                  making a mistake. If you are trying to create a stop-loss or a
                  take-profit, do not use a Limit order.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                disabled={isLoading}
                type="button"
                className="btn btn-sm text-danger btn-zoom--hover font-weight-600"
                onClick={placeOrder}
              >
                {!isLoading ? (
                  'Confirm'
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

export default OrderWarningModal
