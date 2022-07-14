import React, {
  useEffect,
  useState,
  useContext,
  createRef,
  useMemo,
} from 'react'
import { useLocation } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from './Checkout'
import { UserContext } from 'contexts/UserContext'
import { loadStripe } from '@stripe/stripe-js'
import {
  createSubscripton,
  updatePaymentMethod,
  getFirestoreDocumentData,
  verifyCouponCode,
} from 'services/api'
import { firebase } from 'services/firebase'
import { plansDescription } from 'constants/Plans'
import { useNotifications } from 'reapop'
import CoinbaseCommerceButton from 'react-coinbase-commerce'
import 'react-coinbase-commerce/dist/coinbase-commerce-button.css'
import { Modal } from 'components'
import { config } from 'constants/config'
import { cloneDeep } from 'lodash'
import { consoleLogger } from 'utils/logger'

const Plans = ({ canShowTrial }) => {
  const { products, userData } = useContext(UserContext)
  const db = firebase.firestore()
  const location = useLocation()
  const [plans, setPlans] = useState([])
  const [creds, setCreds] = useState(null)
  const [isLoading, setIsLoading] = useState('')
  const [activePlan, setActivePlan] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [cryptoStatus, setCryptoStatus] = useState(false)
  const [showCryptoModal, setShowCryptoModal] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponApplied, setCouponApplied] = useState(false)
  const [trialCouponApplied, setTrialCouponApplied] = useState(false)
  const { notify } = useNotifications()

  const getPrice = useMemo(() => {
    if (activePlan)
      if (creds?.coupon && activePlan.name == 'Monthly Subscription')
        return creds.monthly_price
      else if (creds?.coupon && activePlan.name == 'Yearly Subscription')
        return creds.yearly_price
      else return activePlan.prices[0].price
  })

  const fetchPaymentIntent = async (plan) => {
    try {
      setIsLoading(plan.id)
      getFirestoreDocumentData('subscriptions', userData.email)
        .then(async (data) => {
          const { customer_id } = data.data()
          setCustomerId(customer_id)
          const payload = !!plan.id
            ? { customer_id: customer_id, price_id: plan.prices[0].id }
            : { provider: 'trial', customer_id: customer_id }

          if (couponApplied || trialCouponApplied) payload['coupon_id'] = coupon

          const res = await createSubscripton(payload)
          if (res)
            if (res?.plan === 'Free') {
              paymentCallback('Free')
            } else {
              setCreds((prev) => {
                return { ...prev, ...res }
              })
              setActivePlan(plan)
            }
        })
        .finally(() => setIsLoading(''))
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

  const setInitPlans = async () => {
    if (location.pathname === '/plans') {
      setPlans(
        [
          { prices: [{ price: 0 }], name: 'Free Trial for 5 days' },
          ...cloneDeep(products),
        ].sort(function (a, b) {
          return a.prices[0].price - b.prices[0].price
        })
      )
    } else {
      setPlans(
        cloneDeep(products).sort(function (a, b) {
          return a.prices[0].price - b.prices[0].price
        })
      )
    }
  }

  const applyCode = async () => {
    try {
      setCouponApplied(false)
      setTrialCouponApplied(false)
      setInitPlans()
      setCreds(null)
      setCouponLoading(true)
      const res = await verifyCouponCode({ coupon })
      if (res.status !== 200) {
        notify({
          status: 'error',
          title: 'Error',
          message: res.response.data.message,
        })
        return
      }

      if (res.data?.trial_days) {
        setPlans((prev) => {
          let newProducts = prev
          newProducts[0].name = `Free Trial for ${res.data.trial_days} days`
          return newProducts
        })
        setTrialCouponApplied(true)
        return
      }

      setPlans((prev) => {
        return prev.map((element) => {
          const newElement = element
          if (element.name === 'Monthly Subscription')
            newElement.prices[0].price = res.data['monthly_price']
          else if (element.name === 'Yearly Subscription')
            newElement.prices[0].price = res.data['yearly_price']

          return newElement
        })
      })
      setCreds((prev) => {
        return { ...prev, ...res.data, coupon }
      })
      setCouponApplied(true)
    } catch (error) {
      consoleLogger(error)
      notify({
        status: 'error',
        title: 'Error',
        message: 'This coupon code is not valid.',
      })
    } finally {
      setCouponLoading(false)
    }
  }

  useEffect(() => {
    setInitPlans()
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
      consoleLogger(error)
      notify({
        status: 'error',
        title: 'Error',
        message: (
          <p>
            Something went wrong! Please report at:{' '}
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

  const cryptoSuccessPayment = async (type) => {
    setIsLoading(true)
    try {
      await db
        .collection('user_data')
        .doc(userData.email)
        .set({ firstLogin: false }, { merge: true })
      getFirestoreDocumentData('subscriptions', userData.email).then(
        async (data) => {
          const { customer_id } = data.data()
          await createSubscripton(
            {
              data: { charge_code: type.code, provider: 'coinbase' },
              customer_id: customer_id,
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
      <div className="row align-items-center text-center m-1">
        <h2 className="mr-3">{activePlan ? 'Checkout' : 'Choose your plan'}</h2>
        {!activePlan && (
          <div className="align-items-center d-none d-flex ml-sm-auto mt-0">
            <input
              type="text"
              className="form-control form-control-sm mr-2"
              placeholder="Apply coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            ></input>
            <button
              className="btn btn-primary btn-sm"
              onClick={applyCode}
              disabled={!coupon.length}
            >
              {couponLoading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                'Apply'
              )}
            </button>
          </div>
        )}
      </div>
      {!activePlan && !creds?.clientSecret ? (
        <div className="row mt-4">
          {plans.map((product) => {
            return (
              <div
                key={product.id}
                className={`${
                  location.pathname === '/plans' ? 'col-md-4' : 'col-md-6'
                } py-md-0 text-center`}
              >
                <div className="card card-pricing text-center px-3 shadow hover-scale-110">
                  <div className="card-header py-5 border-0 delimiter-bottom">
                    {couponApplied && product.prices[0].price !== 0 && (
                      <span className="badge badge-soft-success m-3">
                        Coupon code applied
                      </span>
                    )}
                    {trialCouponApplied && product.prices[0].price === 0 && (
                      <span className="badge badge-soft-success m-3">
                        Coupon code applied
                      </span>
                    )}
                    <div className="h1 text-center mb-0">
                      $
                      <span
                        className="price font-weight-bolder"
                        ref={product.ref ? product.ref : null}
                      >
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
                {product.prices[0].interval === 'year' && config.cryptoPayment && (
                  <>
                    <div class="alert alert-modern">
                      <span class="badge badge-danger badge-pill">
                        Important
                      </span>
                      <span class="alert-content text-danger">
                        <b>Use only ETH network.</b>
                      </span>
                    </div>
                    <CoinbaseCommerceButton
                      disabled={isLoading}
                      className="btn btn-sm btn-warning hover-translate-y-n3 hover-shadow-lg mt-0"
                      checkoutId={'ab6f040a-5d52-47f0-a103-44923ac78215'}
                      onPaymentDetected={handlePaymentDetected}
                      onChargeFailure={handlePaymentDetected}
                      onChargeSuccess={cryptoSuccessPayment}
                    >
                      Pay Crypto for a Year
                    </CoinbaseCommerceButton>
                  </>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="row mt-5">
          <div className="col-md-4 col-lg-4 col-xl-4 py-md-0">
            <h3 className="text-primary">
              {activePlan.name}
              <br />
              {activePlan?.prices && `for $${getPrice}`}
            </h3>
            {couponApplied && (
              <div className="mb-3">
                <span className="badge badge-soft-success">
                  Coupon code: <b>{coupon}</b>
                </span>
              </div>
            )}
            <div className="container">
              <ul className="list-unstyled text-sm">
                {plansDescription.paid.map((item) => (
                  <h6 key={item}>{item}</h6>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-md-8 col-lg-8 col-xl-7 py-md-0">
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
