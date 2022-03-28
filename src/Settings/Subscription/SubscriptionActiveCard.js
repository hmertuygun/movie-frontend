import React, { useMemo, useState } from 'react'
import { UserCheck, UserX } from 'react-feather'
import dayjs from 'dayjs'
import { useNotifications } from 'reapop'
import { subscriptionNames } from '../../constants/subscriptionNames'
import './SubscriptionActiveCard.css'
import { Modal } from '../../components'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Checkout from '../../views/Auth/Checkout'
import { firebase } from '../../firebase/firebase'
import {
  cancelSubscription,
  changeActivePlan,
  createSubscripton,
  updatePaymentMethod,
} from '../../api/api'
import CoinbaseCommerceButton from 'react-coinbase-commerce'

const SubscriptionActiveCard = ({
  subscriptionData,
  needPayment,
  creds,
  card,
  subCreds,
  logout,
  products,
  email,
  getClientSecret,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [showCryptoModal, setShowCryptoModal] = useState(false)
  const [cryptoStatus, setCryptoStatus] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { notify } = useNotifications()
  const db = firebase.firestore()

  const [subscription, priceData, due] = useMemo(() => {
    if (subscriptionData)
      return [
        subscriptionData.subscription,
        subscriptionData.priceData,
        subscriptionData.due,
      ]
  }, [subscriptionData])

  const isCancelled = useMemo(
    () =>
      subscription.status == 'canceled' &&
      dayjs().isBefore(dayjs(subscriptionData.due * 1000)),
    [subscriptionData]
  )

  const SUBSCRIPTION_STATUSES = useMemo(() => {
    return ['incomplete', 'incomplete_expired', 'past_due', 'unpaid']
  }, [])

  const getSubsName = () => {
    switch (subscription.type) {
      case 'crypto':
        return 'Crypto'
      case 'stripe':
        if (isCancelled && subscriptionData.scheduledSubs) return 'Scheduled'
        if (isCancelled) return 'Cancelled'

        return subscriptionNames[priceData.interval]
      default:
        break
    }
  }

  const paymentCallback = async (type) => {
    try {
      await updatePaymentMethod({
        data: { payment_method_id: type.id },
        stripeId: subCreds.stripeId,
      })
    } catch (error) {
      notify({
        status: 'error',
        title: 'Error',
        message: (
          <p>
            We could not change your default payment method. Please report at:{' '}
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
    } finally {
      getClientSecret()
      setShowUpdateModal(false)
    }
  }

  const cryptoSuccessPayment = async (type) => {
    setIsLoading(true)
    try {
      await createSubscripton(
        {
          data: { charge_code: type.code, provider: 'coinbase' },
          customer_id: subCreds.stripeId,
        },
        true
      )
      setTimeout(() => {
        window.location.reload()
      }, 5000)
    } catch (error) {
      console.log(error)
      notify({
        status: 'error',
        title: 'Error',
        message: (
          <p>
            We could not change your plan. Please report at:{' '}
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

  const cancelActiveSubscription = async () => {
    try {
      setIsLoading(true)
      const cancelResponse = await cancelSubscription(subCreds)
      if (cancelResponse) {
        logout()
      }
    } catch (error) {
      console.log(error)
      notify({
        status: 'error',
        title: 'Error',
        message: (
          <p>
            We could not cancel your subscription. Please report at:{' '}
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
    } finally {
      setIsLoading(false)
      setShowCancelModal(false)
    }
  }

  const updatePlan = async () => {
    try {
      setIsLoading(true)
      let changeId = products.filter((product) => {
        return (
          product.name.split(' ')[0].toLowerCase() !==
          priceData.interval.toLowerCase()
        )
      })[0]

      const cancelResponse = await changeActivePlan({
        price_id: changeId.prices[0].id,
        ...subCreds,
      })
      if (cancelResponse) {
        setTimeout(() => {
          window.location.reload()
        }, 5000)
      }
    } catch (error) {
      console.log(error)
      notify({
        status: 'error',
        title: 'Error',
        message: (
          <p>
            We could not cancel your subscription. Please report at:{' '}
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
    } finally {
      setShowCancelModal(false)
    }
  }

  const cardInfo = useMemo(() => {
    if (subscription.type !== 'crypto')
      if (card) {
        return (
          <h5 className="pt-4">
            **** **** **** {card.last4} {card.exp_month}/{card.exp_year}
          </h5>
        )
      } else if (subscription.status !== 'trialling' && !isCancelled) {
        return (
          <span className="mb-5">
            Loading Active Card
            <span
              className="spinner-border spinner-border-sm ml-2 mb-1"
              role="status"
              aria-hidden="true"
            ></span>
          </span>
        )
      }
  }, [card, subscription])

  const firstTitle = useMemo(() => {
    return `${getSubsName()} Subscription`
  }, [subscription])

  const description = useMemo(() => {
    if (subscription.status === 'trialling') {
      return `Your trial will end on ${dayjs(due * 1000).format(
        'MMM DD, YYYY'
      )}. Please add a payment method to keep your account active. If you don’t have a payment method added, your
      subscription will be cancelled automatically.`
    } else if (subscription.status === 'trialling' && needPayment) {
      return `Please add a payment method to keep your account active. If you don’t have a payment method added, your
      subscription will be cancelled automatically.`
    } else if (SUBSCRIPTION_STATUSES.includes(subscription.status)) {
      return `Your subscription has expired at ${dayjs(due * 1000).format(
        'MMM DD, YYYY'
      )}. Please check your payment menthod or add a new one.`
    } else if (needPayment) {
      return `Please add a payment method to keep your account active. If you don’t have a payment method added, your
      subscription will be cancelled automatically.`
    } else if (isCancelled) {
      if (subscriptionData.scheduledSubs) {
        return `Your current subscription will be cancelled on ${dayjs(
          due * 1000
        ).format(
          'MMM DD, YYYY'
        )}. Your new subscription will be active when the current one finish.`
      }
      return `Your subscription is active until ${dayjs(due * 1000).format(
        'MMM DD, YYYY'
      )}. You need to add payment method after the due to keep your account active.`
    } else {
      if (subscription.type === 'crypto') {
        return `You are paying 
        ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: priceData?.currency,
          maximumSignificantDigits: 7,
        }).format(priceData?.unit_amount)}
        ${priceData?.interval.toLowerCase()}. Your subscription is active until ${dayjs(
          due * 1000
        ).format(
          'MMM DD, YYYY'
        )}. Crypto payments are one time only. You need to add payment method after the due to keep your account active.
        `
      }
      return `You are paying 
      ${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: priceData?.currency,
      }).format(priceData?.unit_amount)}
      ${priceData?.interval.toLowerCase()}. Your payment will renew on ${dayjs(
        due * 1000
      ).format('MMM DD, YYYY')}. ${
        subscriptionData.scheduledSubs
          ? 'You have a scheduled subscription.'
          : ''
      }
      `
    }
  }, [needPayment, subscription, priceData, due])

  const handlePaymentDetected = async (paymentData) => {
    setCryptoStatus(paymentData.event)
    setShowCryptoModal(true)
  }

  const actionButtons = useMemo(() => {
    if (subscription.type === 'crypto') return
    if (subscription.status === 'active') {
      return (
        <div className="mt-4">
          <button
            href="#"
            onClick={() => setShowCancelModal(true)}
            className="btn btn-sm btn-danger btn-icon ml-2"
          >
            <span className="btn-inner--text">Cancel Subscription</span>
            <span className="btn-inner--icon">
              <i data-feather="arrow-right" className="text-warning"></i>
            </span>
          </button>
          <button
            href="#"
            onClick={() => setShowUpdateModal(true)}
            className="btn btn-sm btn-warning btn-icon mt-4"
          >
            <span className="btn-inner--text">Change Credit Card</span>
            <span className="btn-inner--icon">
              <i data-feather="arrow-right" className="text-warning"></i>
            </span>
          </button>
          <button
            href="#"
            onClick={() => setShowChangeModal(true)}
            className="btn btn-sm btn-primary btn-icon mt-4"
          >
            <span className="btn-inner--text">Change Active Plan</span>
            <span className="btn-inner--icon">
              <i data-feather="arrow-right" className="text-warning"></i>
            </span>
          </button>
        </div>
      )
    } else if (isCancelled && subscriptionData.scheduledSubs) {
      return (
        <div className="mt-4">
          <button
            href="#"
            onClick={() => setShowUpdateModal(true)}
            className="btn btn-sm btn-warning btn-icon mt-4"
          >
            <span className="btn-inner--text">Change Credit Card</span>
            <span className="btn-inner--icon">
              <i data-feather="arrow-right" className="text-warning"></i>
            </span>
          </button>
        </div>
      )
    }
  }, [subscription])

  return (
    <div className="card card-fluid">
      <div className="card-body">
        <div className="row">
          <div className="col-md-8">
            <div className="d-flex align-items-center align-items-center mb-3">
              <div>
                <div className="icon icon-sm icon-shape bg-warning text-white rounded-circle mr-3">
                  <UserCheck size={16} strokeWidth="3" />
                </div>
              </div>
              <span className="h6 mb-0">{firstTitle}</span>
            </div>
            {cardInfo}
            <p className="opacity-8">{description}</p>
          </div>
          <div className="col-12 col-md-4 align-items-end">{actionButtons}</div>
        </div>
      </div>
      {showCancelModal && (
        <Modal>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body">
                <div className="pt-5 text-center">
                  <div className="icon text-danger custom-icon-container">
                    <UserX size={16} strokeWidth={3} />
                  </div>
                  <h4 className="h5 mt-5 mb-3">
                    Do you want to cancel your current subscription?
                  </h4>
                  <p>
                    Your subscription will be cancelled immediately. You will
                    not be able to use CoinPanel. Don't worry, you can subscribe
                    again later.
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-danger btn-zoom--hover font-weight-600"
                  onClick={cancelActiveSubscription}
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
                  onClick={() => setShowCancelModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
      {showUpdateModal && (
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
                  onClick={() => setShowUpdateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
      {showChangeModal && (
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
                      class="btn btn-soft-primary"
                    >
                      Change to{' '}
                      {priceData.interval === 'Yearly' ? 'Monthly ' : 'Yearly '}
                      Payment
                    </button>
                    <CoinbaseCommerceButton
                      disabled={isLoading}
                      className="btn btn-sm btn-warning hover-translate-y-n3 hover-shadow-lg mt-4"
                      checkoutId={'6f7b8bc3-7e0a-4822-8781-be335b30d2b6'}
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
                  onClick={() => setShowChangeModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Modal>
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
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default SubscriptionActiveCard
