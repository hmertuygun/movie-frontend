import React, { useState, useEffect, useContext } from 'react'
import Moment from 'react-moment'
import { Bell } from 'react-feather'

import { errorNotification } from '../../components/Notifications'
import { callCloudFunction } from '../../api/api'
import { UserContext } from '../../contexts/UserContext'
const SubscriptionActiveCard = ({ subscriptionData, needPayment }) => {
  const { subscription, priceData } = subscriptionData
  const [portalLoading, setPortalLoading] = useState(false)
  const [payCrypto, setPayCrypto] = useState(false)
  const { cancel_at_period_end } = subscription

  const subscriptionNames = {
    month: 'Monthly',
    year: 'Yearly',
  }

  const getSubsName = () => {
    return subscriptionNames[subscription.items[0].plan.interval]
  }

  const isDiscount = () => {
    const date1 = new Date(subscription.current_period_end.seconds * 1000)
    const isOver = new Date() > date1
    const diffTime = Math.abs(new Date() - date1)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return (
      (subscription.status == 'trialing' && diffDays < 15) ||
      (subscription.status == 'active' &&
        subscription.items[0].plan.interval == 'month')
    )
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
            <div className="media align-items-center">
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
                    per {priceData?.interval} after trial.
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
                  <p className="mb-0 text-sm text-muted lh-150">
                    You are paying {` `}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: priceData?.currency,
                    }).format((priceData?.unit_amount / 100).toFixed(2))}
                    {` `}
                    per {priceData?.interval}
                    {` `}
                  </p>
                  {!cancel_at_period_end ? (
                    <p className="mb-0 text-sm text-muted lh-150">
                      Your subscription will auto-renew on {` `}
                      <Moment unix format="hh:mm A MMMM DD, YYYY">
                        {subscription.current_period_end.seconds}
                      </Moment>
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 col-lg-4 flex-fill mt-sm-0 text-sm-right">
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
              >
                {needPayment ? 'Add Payment Method' : 'Manage Subscription'}
              </div>
            )}
          </div>
          {isDiscount() && (
            <div
              onClick={() =>
                window
                  .open('https://cryptopayment.coinpanel.com/', '_blank')
                  .focus()
              }
              style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              className="col-lg-12 m-2"
            >
              <span className="badge badge-soft-success ">
                Limited time discount! Yearly Subscription for $199 when you pay
                with crypto. Get 5 months free!
                <u style={{ marginLeft: '3px' }}>Click here.</u>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubscriptionActiveCard
