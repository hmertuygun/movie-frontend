import React, { useState } from 'react'
import Moment from 'react-moment'

import { firebase, auth } from '../../firebase/firebase'
import { Bell } from 'react-feather'

const SubscriptionActiveCard = ({ subscriptionData }) => {
  const { subscription, priceData, plan } = subscriptionData
  const [portalLoading, setPortalLoading] = useState(false)

  const toCustomerPortal = async () => {
    setPortalLoading(true)
    const functionRef = firebase
      .app()
      .functions('europe-west1')
      .httpsCallable('ext-firestore-stripe-subscriptions-createPortalLink')
    const { data } = await functionRef({ returnUrl: window.location.origin })
    window.location.assign(data.url)
    setPortalLoading(false)
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
                <h5 className="mb-0">{`${plan? plan.toUpperCase(): subscription?.role?.toUpperCase()} ${
                  subscription.status === 'trialing' ? '| Trial' : ''
                }`}</h5>
                <p className="text-muted lh-150 text-sm mb-0">
                  {subscription.status === 'trialing'
                    ? 'You will pay '
                    : 'You are paying '}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: priceData.currency,
                  }).format((priceData.unit_amount / 100).toFixed(2))}{' '}
                  per {priceData.interval}{' '}
                  {subscription.status === 'trialing' ? 'after trial' : null}
                </p>
                <p className="text-muted lh-150 text-sm mb-0">
                  {subscription.status === 'trialing'
                    ? 'Your trial will end on '
                    : 'Your subscription will auto-renew on '}
                  <Moment unix format="hh:mm:ss MMMM DD, YYYY">
                    {subscription.current_period_end.seconds}
                  </Moment>{' '}
                  - {subscription.current_period_end.seconds}
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-5 flex-fill mt-4 mt-sm-0 text-sm-right">
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
                onClick={toCustomerPortal}
              >
                Access customer portal
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionActiveCard
