import React, { useContext } from 'react'

import SubscriptionCard from './SubscriptionCard'
import SubscriptionActiveCard from './SubscriptionActiveCard'
import { UserContext } from '../../contexts/UserContext'

const Subscription = () => {
  const { isCheckingSub, hasSub, needPayment, products, subscriptionData } =
    useContext(UserContext)

  return (
    <div className="row pt-5">
      <div className="col-lg-12">
        {!isCheckingSub ? (
          hasSub ? (
            <SubscriptionActiveCard
              subscriptionData={subscriptionData}
              needPayment={needPayment}
            />
          ) : (
            products.map((product) => (
              <SubscriptionCard product={product} key={product.id} />
            ))
          )
        ) : null}
      </div>
    </div>
  )
}

export default Subscription
