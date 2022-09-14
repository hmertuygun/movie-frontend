import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { UserCheck } from 'react-feather'
import dayjs from 'dayjs'
import { notify } from 'reapop'
import { subscriptionNames } from 'constants/subscriptionNames'
import './SubscriptionActiveCard.css'
import {
  cancelSubscription,
  changeActivePlan,
  createSubscripton,
  sendActionReason,
  updatePaymentMethod,
} from 'services/api'
import {
  CryptoStatusModal,
  SubscriptionChange,
  SubscriptionCancel,
  SubscriptionUpdate,
} from './Modals'
import { consoleLogger } from 'utils/logger'
import { DELETION_REASONS } from 'constants/deletionReasons'
import MESSAGES from 'constants/Messages'
import { useDispatch } from 'react-redux'

const SubscriptionActiveCard = ({
  subscriptionData,
  needPayment,
  creds,
  card,
  subCreds,
  products,
  getClientSecret,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [showCryptoModal, setShowCryptoModal] = useState(false)
  const [cryptoStatus, setCryptoStatus] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deletionReasons, setDeletionReasons] = useState([])
  const dispatch = useDispatch()
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
      dispatch(notify(MESSAGES['payment-change-failed'], 'error'))
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
      consoleLogger(error)
      dispatch(notify(MESSAGES['plan-change-failed'], 'error'))
    }
  }

  const cancelActiveSubscription = async () => {
    try {
      setIsLoading(true)
      const cancelReason = {
        reasons: deletionReasons,
        feedback: '',
        type: 'cancel',
      }
      if (deletionReasons.length) {
        await sendActionReason(cancelReason)
      }
      const cancelResponse = await cancelSubscription(subCreds)
      if (cancelResponse) {
        setTimeout(() => {
          window.location.reload()
        }, 8000)
      }
    } catch (error) {
      consoleLogger(error)
      dispatch(notify(MESSAGES['cancel-subscription-failed'], 'error'))
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
      consoleLogger(error)
      dispatch(notify(MESSAGES['change-subscription-failed'], 'error'))
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
      )}. ${MESSAGES['no-payment-method-added']}`
    } else if (subscription.status === 'trialling' && needPayment) {
      return MESSAGES['no-payment-method-added']
    } else if (SUBSCRIPTION_STATUSES.includes(subscription.status)) {
      return `Your subscription has expired at ${dayjs(due * 1000).format(
        'MMM DD, YYYY'
      )}. Please check your payment menthod or add a new one.`
    } else if (needPayment) {
      return MESSAGES['no-payment-method-added']
    } else if (subscriptionData.scheduledSubs) {
      const value =
        subscriptionData.scheduledSubs?.plan === 'Yearly' ? 'yearly' : 'monthly'
      return `You are paying       ${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: priceData?.currency,
      }).format(
        priceData?.unit_amount
      )} ${priceData?.interval.toLowerCase()}. Your subscription plan will change on ${dayjs(
        due * 1000
      ).format('MMM DD, YYYY')} to ${value}.`
    } else if (isCancelled) {
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
      if (subscriptionData.couponUsed) {
        return `You paid 
        ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: priceData?.currency,
        }).format(priceData?.unit_amount)}
        for one period with coupon code. Your payment will renew on ${dayjs(
          due * 1000
        ).format('MMM DD, YYYY')}.`
      }
      return `You are paying 
      ${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: priceData?.currency,
      }).format(priceData?.unit_amount)}
      ${priceData?.interval.toLowerCase()}. Your payment will renew on ${dayjs(
        due * 1000
      ).format('MMM DD, YYYY')}.`
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
          {!subscriptionData.scheduledSubs && (
            <button
              href="#"
              onClick={() => setShowCancelModal(true)}
              className="btn btn-sm btn-danger btn-icon ml-2 w-100"
            >
              <span className="btn-inner--text">Cancel Subscription</span>
            </button>
          )}
          <button
            href="#"
            onClick={() => setShowUpdateModal(true)}
            className="btn btn-sm btn-warning btn-icon mt-4 w-100"
          >
            <span className="btn-inner--text">Change Credit Card</span>
          </button>
          {!subscriptionData.scheduledSubs && (
            <button
              href="#"
              onClick={() => setShowChangeModal(true)}
              className="btn btn-sm btn-primary btn-icon mt-4 w-100"
            >
              <span className="btn-inner--text">Change Active Plan</span>
            </button>
          )}
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
        <SubscriptionCancel
          isLoading={isLoading}
          handleSuccess={cancelActiveSubscription}
          handleCancel={() => setShowCancelModal(false)}
          handleChange={(data) => setDeletionReasons(data)}
          showInfo={DELETION_REASONS.length !== deletionReasons.length}
        />
      )}
      {showUpdateModal && (
        <SubscriptionUpdate
          paymentCallback={paymentCallback}
          creds={creds}
          handleCancel={() => setShowUpdateModal(false)}
        />
      )}
      {showChangeModal && (
        <SubscriptionChange
          handleClickCancel={() => setShowChangeModal(false)}
          priceData={priceData}
          isLoading={isLoading}
          handlePaymentDetected={handlePaymentDetected}
          cryptoSuccessPayment={cryptoSuccessPayment}
          updatePlan={updatePlan}
        />
      )}
      {showCryptoModal && (
        <CryptoStatusModal
          handleClickCancel={() => setShowCryptoModal(false)}
          status={cryptoStatus}
        />
      )}
    </div>
  )
}

SubscriptionActiveCard.propTypes = {
  subscriptionData: PropTypes.object,
  needPayment: PropTypes.bool,
  creds: PropTypes.object,
  card: PropTypes.object,
  subCreds: PropTypes.object,
  products: PropTypes.array,
  getClientSecret: PropTypes.func,
}

export default SubscriptionActiveCard
