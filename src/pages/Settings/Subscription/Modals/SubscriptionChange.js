import React from 'react'
import CoinbaseCommerceButton from 'react-coinbase-commerce'
import { Modal } from 'components'

const SubscriptionChange = ({
  priceData,
  isLoading,
  handleClickCancel,
  handlePaymentDetected,
  cryptoSuccessPayment,
  updatePlan,
}) => {
  return (
    <Modal>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body">
            <h5>Update Active Plan</h5>
            <div className="">
              <h6>
                Active Plan: <b>{priceData.interval} Payment</b>
              </h6>
              <div className="mt-4">
                <button
                  onClick={updatePlan}
                  type="button"
                  disabled={isLoading}
                  className="btn btn-soft-primary"
                >
                  Change to{' '}
                  {priceData.interval === 'Yearly' ? 'Monthly ' : 'Yearly '}
                  Payment
                </button>
                <CoinbaseCommerceButton
                  disabled={isLoading}
                  className="btn btn-sm btn-warning hover-translate-y-n3 hover-shadow-lg mt-4"
                  checkoutId={'ab6f040a-5d52-47f0-a103-44923ac78215'}
                  onPaymentDetected={handlePaymentDetected}
                  onChargeFailure={handlePaymentDetected}
                  onChargeSuccess={cryptoSuccessPayment}
                >
                  Pay Crypto for a Year
                </CoinbaseCommerceButton>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              disabled={isLoading}
              className="btn btn-sm btn-secondary"
              onClick={handleClickCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default SubscriptionChange
