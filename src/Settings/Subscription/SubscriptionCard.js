import React, { useState, useMemo } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { auth, firebase } from '../../firebase/firebase'
import { Bell } from 'react-feather'
import { coinBaseUrls } from '../../constants/coinbaseUrls'

const SubscriptionCard = ({ product }) => {
  const [subscribing, setSubscribing] = useState(false)
  const currentUser = auth.currentUser
  const db = firebase.firestore()
  const { name, prices } = product
  // only support one price
  const price = prices[0]

  const getFPTid = useMemo(() => {
    return window.FPROM && window.FPROM.data.tid
  }, [])

  const redirectForCrypto = (type) => {
    return (window.location = coinBaseUrls[type])
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
        clientReferenceId: getFPTid,
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
          {price.interval === 'year' && (
            <div className="col-auto flex-fill mt-3 mt-sm-0 text-sm-right">
              <div
                className="btn btn-sm btn-neutral rounded-pill"
                onClick={() => redirectForCrypto(price.interval)}
              >
                Pay with Crypto
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubscriptionCard
