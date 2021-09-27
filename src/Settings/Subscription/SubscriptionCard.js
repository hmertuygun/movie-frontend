import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

import { firebase, auth } from '../../firebase/firebase'
import { Bell, X } from 'react-feather'
import { Modal } from '../../components'

const SubscriptionCard = ({ product }) => {
  const [subscribing, setSubscribing] = useState(false)
  const [showCryptoModal, setShowCryptoModal] = useState(false)
  const currentUser = auth.currentUser
  const db = firebase.firestore()
  const { name, prices } = product

  // only support one price
  const price = prices[0]

  const getFPTid = () => {
    return window.FPROM && window.FPROM.data.tid
  }

  const subscribe = async (e) => {
    setSubscribing(true)
    e.preventDefault()
    const selectedPrice = {
      price: price.id,
      dynamic_tax_rates: [],
      quantity: 1,
    }

    const docRef = await db
      .collection('stripe_users')
      .doc(currentUser.uid)
      .collection('checkout_sessions')
      .add({
        allow_promotion_codes: true,
        line_items: [selectedPrice],
        success_url: window.location.origin,
        cancel_url: window.location.origin,
        clientReferenceId: getFPTid(),
        metadata: {
          key: 'value',
        },
      })
    // Wait for the CheckoutSession to get attached by the extension
    docRef.onSnapshot(async (snap) => {
      const { error, sessionId } = snap.data()
      if (error) {
        // Show an error to your customer and
        // inspect your Cloud Function logs in the Firebase console.
        alert(`An error occured: ${error.message}`)
        setSubscribing(false)
      }
      if (sessionId) {
        // We have a session, let's redirect to Checkout
        // Init Stripe
        const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY)
        const stripe = await stripePromise
        stripe.redirectToCheckout({ sessionId })
        setSubscribing(false)
      }
    })
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="row row-grid align-items-center">
          <div className="col-lg-7">
            <div className="media align-items-center">
              <span className="avatar bg-danger text-white rounded-circle mr-3">
                <Bell size={16} strokeWidth="3" />
              </span>
              <div className="media-body">
                <h5 className="mb-0">{`${name} | ${new Intl.NumberFormat(
                  'en-US',
                  {
                    style: 'currency',
                    currency: price.currency,
                  }
                ).format(price.price)} / ${price.interval}`}</h5>
                {/* <p className="text-muted lh-150 text-sm mb-0">
                  Email: denigada@gmail.com
                </p>
                <p className="text-muted lh-150 text-sm mb-0">
                  Your subscription will auto-renew on January 10th, 2020
                </p> */}
              </div>
            </div>
          </div>
          <div className="col-auto flex-fill mt-4 mt-sm-0 text-sm-right">
            {name === 'Yearly Subscription' && (
              <div
                className="btn btn-sm btn-neutral rounded-pill"
                onClick={() => setShowCryptoModal(true)}
              >
                Pay with crypto
              </div>
            )}
            {subscribing ? (
              <div className="btn btn-sm btn-neutral rounded-pill">
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              </div>
            ) : (
              <>
                <div
                  className="btn btn-sm btn-neutral rounded-pill"
                  onClick={subscribe}
                >
                  Subscribe
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {showCryptoModal && (
        <Modal>
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 20,
                  zIndex: 9,
                }}
              >
                <X size="20" onClick={() => setShowCryptoModal(false)} />
              </div>
              <div
                class="modal-body mt-4"
                style={{
                  textAlign: 'center',
                }}
              >
                <div class="text-center">
                  <h4 class="h6 mt-2 mb-2">
                    Contact @panelboss on Telegram to pay with crypto.
                  </h4>

                  <h4 class="h6 mt-2 mb-2">
                    Beware of scammers. We will never contact you first.
                  </h4>
                </div>
                <a href="https://t.me/panelboss" target="_blank">
                  <button type="button" class="btn btn-primary btn-sm mt-2">
                    Contact on Telegram
                  </button>
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default SubscriptionCard
