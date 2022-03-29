import React, { useEffect, useState, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from './Checkout'
import { UserContext } from '../../contexts/UserContext'
import { loadStripe } from '@stripe/stripe-js'
import { createSubscripton, updatePaymentMethod } from '../../api/api'
import { getFirestoreDocumentData } from '../../api/firestoreCall'
import { firebase } from '../../firebase/firebase'
import { plansDescription } from '../../constants/Plans'
import { useNotifications } from 'reapop'
import CoinbaseCommerceButton from 'react-coinbase-commerce'
import 'react-coinbase-commerce/dist/coinbase-commerce-button.css'
import { Modal } from '../../components'

const Plans = ({ canShowTrial }) => {
  const { products, userData, getSubscriptionsData, setState } =
    useContext(UserContext)
  const db = firebase.firestore()
  const location = useLocation()
  const [plans, setPlans] = useState(products)
  const [creds, setCreds] = useState(null)
  const [isLoading, setIsLoading] = useState('')
  const [activePlan, setActivePlan] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [cryptoStatus, setCryptoStatus] = useState(false)
  const [showCryptoModal, setShowCryptoModal] = useState(false)
  const { notify } = useNotifications()

  const fetchPaymentIntent = async (plan) => {
    setIsLoading(plan.id)
    getFirestoreDocumentData('stripe_users', userData.uid)
      .then(async (data) => {
        const { stripeId } = data.data()
        setCustomerId(stripeId)
        const payload = !!plan.id
          ? { customer_id: stripeId, price_id: plan.prices[0].id }
          : { provider: 'trial', customer_id: stripeId }

        const res = await createSubscripton(payload)
        if (res)
          if (res?.plan === 'Free') {
            paymentCallback('Free')
          } else {
            setCreds(res)
            setActivePlan(plan)
          }
      })
      .finally(() => setIsLoading(''))
  }

  useEffect(() => {
    if (location.pathname === '/plans') {
      setPlans([
        { prices: [{ price: 0 }], name: 'Free Trial for 5 days' },
        ...products,
      ])
    }
  }, [products, location])

  const paymentCallback = async (intent) => {
    try {
      await db
        .collection('user_data')
        .doc(userData.email)
        .set({ firstLogin: false }, { merge: true })
      if (typeof intent !== 'string') {
        await updatePaymentMethod({
          data: { payment_method_id: intent.payment_method },
          stripeId: customerId,
        })
      }
      window.location.reload()
    } catch (error) {
      console.log(error)
    }
  }

  const cryptoSuccessPayment = async (type) => {
    setIsLoading(true)
    try {
      await db
        .collection('user_data')
        .doc(userData.email)
        .set({ firstLogin: false }, { merge: true })
      getFirestoreDocumentData('stripe_users', userData.uid).then(
        async (data) => {
          const { stripeId } = data.data()
          await createSubscripton(
            {
              data: { charge_code: type.code, provider: 'coinbase' },
              customer_id: stripeId,
            },
            true
          )
          setTimeout(() => {
            window.location.reload()
          }, 5000)
        }
      )
    } catch (error) {
      notify({
        status: 'error',
        title: 'Error',
        message: (
          <p>
            We could not get the payment. Please report at:{' '}
            <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://support.coinpanel.com"
            >
              <b>support.coinpanel.com</b>
            </a>
          </p>
        ),
      })
    }
  }

  const handlePaymentDetected = async (paymentData) => {
    if (paymentData.event === 'charge_confirmed') {
      window.location.reload()
    } else {
      setCryptoStatus(paymentData.event)
      setShowCryptoModal(true)
    }
  }

  return (
    <div className="container mb-5 d-flex flex-column">
      <div className="row align-items-center text-center">
        <h2>{activePlan ? 'Checkout' : 'Choose your plan'}</h2>
      </div>
      {!activePlan && !creds ? (
        <div className="row mt-4">
          {plans.map((product) => {
            return (
              <div
                key={product.id}
                className={`${
                  location.pathname === '/plans' ? 'col-md-4' : 'col-md-6'
                } py-6 py-md-0 text-center`}
              >
                <div className="card card-pricing text-center px-3 shadow hover-scale-110">
                  <div className="card-header py-5 border-0 delimiter-bottom">
                    <div className="h1 text-center mb-0">
                      $
                      <span className="price font-weight-bolder">
                        {product.prices[0].price}
                      </span>
                    </div>
                    <span className="h6 text-muted">{product.name}</span>
                  </div>
                  <div className="card-body">
                    <ul className="list-unstyled text-sm mb-4">
                      {plansDescription[
                        product.prices[0].price === 0 ? 'free' : 'paid'
                      ].map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <button
                      href="#"
                      className="btn btn-sm btn-primary hover-translate-y-n3 hover-shadow-lg mb-3"
                      onClick={() => fetchPaymentIntent(product)}
                      disabled={!!isLoading}
                    >
                      {isLoading === product.id ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : product.prices[0].price === 0 ? (
                        'Start Trial'
                      ) : (
                        'Subscribe With Card'
                      )}
                    </button>
                  </div>
                </div>
                {product.prices[0].interval === 'year' && (
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
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="row mt-5">
          <div className="col-md-4 col-lg-4 col-xl-4 py-6 py-md-0">
            <h3 className="text-primary">
              {activePlan.name}
              <br />
              {activePlan?.prices && `for $${activePlan.prices[0].price}`}
            </h3>
            <div className="container">
              <ul className="list-unstyled text-sm">
                {plansDescription.paid.map((item) => (
                  <h6 key={item}>{item}</h6>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-md-8 col-lg-8 col-xl-7 py-6 py-md-0">
            <Elements
              stripe={loadStripe(process.env.REACT_APP_STRIPE_KEY)}
              options={creds}
            >
              <CheckoutForm creds={creds} paymentCallback={paymentCallback} />
            </Elements>
          </div>
        </div>
      )}
      {showCryptoModal && (
        <Modal>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body">
                <h5>Crypto Payment</h5>
                <div className="">
                  <div class="alert alert-info" role="alert">
                    <p>
                      {cryptoStatus === 'charge_confirmed'
                        ? 'We have received your payment. You will be redirected to homepage.'
                        : cryptoStatus === 'charge_failed'
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
                  onClick={() => setShowCryptoModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Plans
