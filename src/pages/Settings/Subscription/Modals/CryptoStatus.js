import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'components'

const CryptoStatusModal = ({ status, handleClickCancel }) => {
  return (
    <Modal>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body">
            <h5>Crypto Payment</h5>
            <div className="">
              <div className="alert alert-info" role="alert">
                <p>
                  {status === 'charge_confirmed'
                    ? 'We have received your payment. You will be redirected to homepage.'
                    : status === 'charge_failed'
                    ? 'We could not have received your payment. Please try again or contact us.'
                    : 'Your payment is being processed. Please wait...'}
                </p>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={handleClickCancel}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

CryptoStatusModal.propTypes = {
  status: PropTypes.string,
  handleClickCancel: PropTypes.func,
}

export default CryptoStatusModal
