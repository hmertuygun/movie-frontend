import React, { useState } from 'react'
import Moment from 'react-moment'

import { firebase, auth } from '../../firebase/firebase'
import { Bell } from 'react-feather'

const SubscriptionActiveCard = ({ subscriptionData, needPayment }) => {
  const { subscription, priceData, plan } = subscriptionData
  const [portalLoading, setPortalLoading] = useState(false)

  console.log(subscription, priceData)

  const toCustomerPortal = async (needPayment) => {
    setPortalLoading(true)
    const functionRef = firebase
      .app()
      .functions('europe-west1')
      .httpsCallable('ext-firestore-stripe-subscriptions-createPortalLink')
    const { data } = await functionRef({ returnUrl: window.location.origin })
    console.log('Function Ref ==>', data.url)
    if (needPayment) {
      window.location.assign(data.url + '/payment-methods')
    } else {
      window.location.assign(data.url)
    }
    setPortalLoading(false)
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="row row-grid align-items-center">
          <div className="col-lg-7">
            <div className="media align-items-center">
              <span className="mr-3 text-white avatar bg-danger rounded-circle">
                <Bell size={16} strokeWidth="3" />
              </span>
              {subscription.status === 'trialing' ? (
                <div className="media-body">
                  <h5 className="mb-0">Monthly Subscription | Trial</h5>
                  <p className="mb-0 text-sm text-muted lh-150">
                    You will pay
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: priceData.currency,
                    }).format((priceData.unit_amount / 100).toFixed(2))}{' '}
                    per {priceData.interval} after trial
                  </p>
                  <p className="mb-0 text-sm text-muted lh-150">
                    Your trial will end on
                    <Moment unix format="hh:mm:ss A MMMM DD, YYYY">
                      {subscription.current_period_end.seconds}
                    </Moment>{' '}
                    - {subscription.current_period_end.seconds}
                  </p>
                </div>
              ) : subscription.status === 'past_due' ? (
                <div className="media-body">
                  <h5 className="mb-0">Monthly Subscription</h5>
                  <p className="mb-0 text-sm text-muted lh-150"></p>
                  <p className="mb-0 text-sm text-muted lh-150">
                    Please add a payment method before {` `}
                    <Moment unix format="hh:mm:ss A MMMM DD, YYYY">
                      {subscription.trial_end.seconds + 86400}
                    </Moment>
                    {` `}
                    to keep your subscription active.
                  </p>
                </div>
              ) : needPayment ? (
                <div className="media-body">
                  <h5 className="mb-0">Monthly Subscription</h5>
                  <p className="mb-0 text-sm text-muted lh-150">
                    Your free trial expired
                  </p>
                  <p className="mb-0 text-sm text-muted lh-150">
                    Please add a payment method before {` `}
                    <Moment unix format="hh:mm:ss A MMMM DD, YYYY">
                      {subscription.trial_end.seconds + 3600}
                    </Moment>
                    {` `}
                    to keep your subscription active.
                  </p>
                </div>
              ) : (
                <div className="media-body">
                  <h5 className="mb-0">Monthly Subscription</h5>
                  <p className="mb-0 text-sm text-muted lh-150">
                    You are paying
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: priceData.currency,
                    }).format((priceData.unit_amount / 100).toFixed(2))}{' '}
                    per {priceData.interval}{' '}
                  </p>
                  <p className="mb-0 text-sm text-muted lh-150">
                    Your subscription will auto-renew on
                    <Moment unix format="hh:mm:ss A MMMM DD, YYYY">
                      {subscription.current_period_end.seconds}
                    </Moment>{' '}
                    - {subscription.current_period_end.seconds}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 col-lg-5 flex-fill mt-sm-0 text-sm-right">
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
                {needPayment ? 'Add Payment' : 'Access customer portal'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionActiveCard
