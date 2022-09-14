import React from 'react'
import PropTypes from 'prop-types'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Checkout from 'pages/Auth/Checkout'
import { Modal } from 'components'

const SubscriptionUpdate = ({ paymentCallback, creds, handleCancel }) => {
  return (
    <Modal>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body">
            <h5>Update Active Credit Card</h5>
            <div className="">
              <Elements
                stripe={loadStripe(process.env.REACT_APP_STRIPE_KEY)}
                options={creds}
              >
                <Checkout
                  creds={creds}
                  paymentCallback={paymentCallback}
                  isUpdate={true}
                />
              </Elements>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

SubscriptionUpdate.propTypes = {
  paymentCallback: PropTypes.func,
  creds: PropTypes.object,
  handleCancel: PropTypes.func,
}

export default SubscriptionUpdate
