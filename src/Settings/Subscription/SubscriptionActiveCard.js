import React, { useState, useEffect, useContext } from 'react'
import Moment from 'react-moment'
import { Bell } from 'react-feather'
import { coinBaseUrls } from '../../constants/coinbaseUrls'
import { errorNotification } from '../../components/Notifications'
import { callCloudFunction } from '../../api/api'
import { UserContext } from '../../contexts/UserContext'
import { subscriptionNames } from '../../constants/subscriptionNames'
import dayjs from 'dayjs'
import './SubscriptionActiveCard.css'

const SubscriptionActiveCard = ({ subscriptionData, needPayment }) => {
  const { subscription, priceData, due } = subscriptionData
  const [portalLoading, setPortalLoading] = useState(false)

  const getSubsName = () => {
    return subscription.type !== 'crypto'
      ? subscriptionNames[priceData.interval]
      : 'Crypto'
  }

  const redirectForCrypto = (type) => {
    return (window.location = coinBaseUrls[type])
  }

  const toCustomerPortal = async (needPayment) => {
    setPortalLoading(true)
    try {
      const response = await callCloudFunction(
        'ext-firestore-stripe-subscriptions-createPortalLink'
      )
      if (needPayment) {
        window.location.assign(response?.result?.url + '/payment-methods')
      } else {
        window.location.assign(response?.result?.url)
      }
    } catch (error) {
      errorNotification.open({
        description: error,
      })
      console.log('CustomerPortal Error: ', error)
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="row row-grid align-items-center">
          <div className="col-lg-8">
            <div className="media align-items-center subscription-card">
              <span className="mr-3 text-white avatar bg-danger rounded-circle">
                <Bell size={16} strokeWidth="3" />
              </span>
              {subscription.status === 'trialing' ? (
                <div className="media-body">
                  <h5 className="mb-0">{getSubsName()} Subscription | Trial</h5>
                  <p className="mb-0 text-sm text-muted lh-150">
                    You will pay {` `}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: priceData?.currency,
                    }).format((priceData?.unit_amount / 100).toFixed(2))}
                    {` `}
                    {priceData?.interval} after trial.
                  </p>
                  <p className="mb-0 text-sm text-muted lh-150">
                    Your trial will end on {` `}
                    <Moment unix format="hh:mm A MMMM DD, YYYY">
                      {subscription.current_period_end.seconds}
                    </Moment>
                    .
                  </p>
                  {needPayment ? (
                    <>
                      <p className="mb-0 text-sm text-muted lh-150">
                        Please add a payment method to keep your account active.
                      </p>
                      <p className="mb-0 text-sm text-muted lh-150">
                        If you don’t have a payment method added, your
                        subscription will be cancelled automatically.
                      </p>
                    </>
                  ) : null}
                </div>
              ) : subscription.status === 'past_due' ? (
                <div className="media-body">
                  <h5 className="mb-0">{getSubsName()} Subscription</h5>
                  <p className="mb-0 text-sm text-muted lh-150">
                    Your trial expired at {` `}
                    <Moment unix format="hh:mm A MMMM DD, YYYY">
                      {subscription.trial_end?.seconds}
                    </Moment>
                  </p>
                  <p className="mb-0 text-sm text-muted lh-150">
                    Please add a payment method before {` `}
                    <Moment unix format="hh:mm A MMMM DD, YYYY">
                      {subscription.trial_end?.seconds + 86400}
                    </Moment>
                    {` `}
                    to keep your subscription active.
                  </p>
                </div>
              ) : needPayment ? (
                <div className="media-body">
                  <h5 className="mb-0">{getSubsName()} Subscription</h5>
                  <p className="mb-0 text-sm text-muted lh-150">
                    Your free trial expired on {` `}
                    <Moment unix format="hh:mm A MMMM DD, YYYY">
                      {subscription.trial_end?.seconds}
                    </Moment>
                  </p>
                  <p className="mb-0 text-sm text-muted lh-150">
                    Please add a payment method before {` `}
                    <Moment unix format="hh:mm A MMMM DD, YYYY">
                      {subscription.trial_end?.seconds + 86400}
                    </Moment>
                    {` `}
                    to keep your subscription active.
                  </p>
                </div>
              ) : (
                <div className="media-body">
                  <h5 className="mb-0">{getSubsName()} Subscription</h5>
                  {subscription.type !== 'crypto' ? (
                    <p className="mb-0 text-sm text-muted lh-150">
                      You are paying {` `}
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: priceData?.currency,
                      }).format(priceData?.unit_amount)}
                      {` `}
                      {priceData?.interval.toLowerCase()}
                      {` `}
                    </p>
                  ) : (
                    <p className="mb-0 text-sm text-muted lh-150">
                      You paid {`${priceData.unit_amount}${priceData.currency}`}
                      . Subscription needs to be renewed after{' '}
                      {dayjs(subscriptionData.due * 1000).format(
                        'hh:mm A MMMM DD, YYYY'
                      )}
                    </p>
                  )}
                  {subscription.type !== 'crypto' ? (
                    <p className="mb-0 text-sm text-muted lh-150">
                      Your subscription will auto-renew on {` `}
                      <Moment unix format="hh:mm A MMMM DD, YYYY">
                        {due}
                      </Moment>
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          {subscription.type !== 'crypto' && (
            <div className="mt-4 col-lg-4 flex-fill mt-sm-0 text-sm-right payment-buttons">
              {portalLoading ? (
                <div className="btn btn-sm btn-neutral rounded-pill">
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                </div>
              ) : (
                <div
                  className="btn btn-sm btn-neutral rounded-pill"
                  onClick={() => toCustomerPortal(needPayment)}
                  style={{ width: '13rem' }}
                >
                  {needPayment ? 'Add Payment Method' : 'Manage Subscription'}
                </div>
              )}
              {needPayment && (
                <div>
                  <div
                    style={{ width: '13rem', marginTop: '0.6rem' }}
                    className="btn btn-sm btn-neutral rounded-pill"
                    onClick={() => redirectForCrypto('year')}
                  >
                    Pay Crypto for a Year
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubscriptionActiveCard
