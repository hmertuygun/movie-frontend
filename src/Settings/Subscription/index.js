import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'

import { firebase, auth } from '../../firebase/firebase'

import SubscriptionCard from './SubscriptionCard'
import SubscriptionActiveCard from './SubscriptionActiveCard'

const Subscription = () => {
  const db = firebase.firestore()
  const currentUser = auth.currentUser
  const [isCheckingSub, setIsCheckingSub] = useState(false)
  const [hasSub, setHasSub] = useState(false)
  const [products, setProducts] = useState([])
  const [subscriptionData, setSubscriptionData] = useState(null)

  const getProducts = async () => {
    const plans = []
    await db
      .collection('stripe_plans')
      .where('active', '==', true)
      .get()
      .then(async (querySnapshot) => {
        querySnapshot.forEach(async (doc) => {
          const priceSnap = await doc.ref
            .collection('prices')
            .where('active', '==', true)
            .orderBy('unit_amount')
            .get()
          const productData = doc.data()
          productData['id'] = doc.id
          productData['prices'] = []
          priceSnap.docs.forEach(async (doc) => {
            const priceId = doc.id
            const priceData = doc.data()

            productData.prices.push({
              price: (priceData.unit_amount / 100).toFixed(2),
              currency: priceData.currency,
              interval: priceData.interval,
              id: priceId,
            })
          })
          setProducts((products) => [...products, productData])
        })
      })
  }

  const checkSubscriptionStatus = () => {
    setIsCheckingSub(true)
    const getCustomClaimRole = async () => {
      await currentUser.getIdToken(true)
      const decodedToken = await currentUser.getIdTokenResult()
      return decodedToken.claims.stripeRole
    }

    db.collection('stripe_users')
      .doc(currentUser.uid)
      .collection('subscriptions')
      .where('status', 'in', ['trialing', 'active'])
      .onSnapshot(async (snapshot) => {
        if (snapshot.empty) {
          setIsCheckingSub(false)
          return setHasSub(false)
        }

        const subscription = snapshot.docs[0].data()
        const priceData = (await subscription.price.get()).data()
        const plan = await getCustomClaimRole()
        setSubscriptionData({ subscription, priceData, plan })
        setIsCheckingSub(false)
        setHasSub(true)
      })
  }

  useEffect(() => {
    getProducts()
    checkSubscriptionStatus()
  }, [])

  return (
    <div className="row pt-5">
      <div className="col-lg-12">
        {!isCheckingSub ? (
          hasSub ? (
            <SubscriptionActiveCard subscriptionData={subscriptionData} />
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
