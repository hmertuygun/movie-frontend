import { notify } from 'reapop'
import { messaging } from 'services/firebase'
import httpClient from 'services/http'
import { storeNotificationToken } from './Notifications'
import store from 'store'
import { API_URLS, SUBSCRIPTION_URL, PROJECT_ID } from 'constants/config'

const BASE_URL = SUBSCRIPTION_URL
const subscriptionUrl = API_URLS['subscription']
const stripePlanUrl = API_URLS['stripe-plans']

const getSubscriptionDetails = async () => {
  const apiUrl = BASE_URL
  return await httpClient(apiUrl, 'POST')
}

const callCloudFunction = async (funcName) => {
  const apiUrl = `https://europe-west1-${PROJECT_ID}.cloudfunctions.net/${funcName}`
  const response = await httpClient(apiUrl, 'POST', {
    data: { returnUrl: window.location.origin },
  })
  return response?.data
}

const finishSubscriptionByUser = async () => {
  const apiUrl = `${BASE_URL}finish_trial`
  const response = await httpClient(apiUrl, 'POST', {})
  return response
}

const createSubscripton = async (payload, inside = false) => {
  const apiUrl = `${BASE_URL}${payload.customer_id}/subscription`
  const data = inside ? payload.data : payload
  const response = await httpClient(apiUrl, 'POST', data)
  return response?.data
}

const getStripeClientSecret = async (payload) => {
  const apiUrl = `${BASE_URL}${payload.stripeId}/client_secret/${payload.subscriptionId}`
  const response = await httpClient(apiUrl, 'GET', {})
  return response?.data
}

const updatePaymentMethod = async ({ data, stripeId }) => {
  const apiUrl = `${BASE_URL}${stripeId}/default_payment_method`
  const response = await httpClient(apiUrl, 'PATCH', data)
  return response.data
}

const getDefaultPaymentMethod = async (data) => {
  const apiUrl = `${BASE_URL}${data.stripeId}/default_payment_method`
  const response = await httpClient(apiUrl, 'GET', {})
  return response?.data
}

const cancelSubscription = async (data) => {
  const apiUrl = `${BASE_URL}${data.stripeId}/subscription/${data.subscriptionId}`
  const response = await httpClient(apiUrl, 'DELETE', {})
  return response
}

const changeActivePlan = async (data) => {
  const apiUrl = `${BASE_URL}${data.stripeId}/subscription/${data.subscriptionId}/plan`
  const response = await httpClient(apiUrl, 'PATCH', data)
  return response.data
}

const verifyCouponCode = async (data) => {
  const apiUrl = `${BASE_URL}coupon/${data.coupon}`
  const response = await httpClient(apiUrl, 'GET', {})
  return response
}

const FCMSubscription = async () => {
  try {
    const np = await Notification.requestPermission() // "granted", "denied", "default"
    if (np === 'denied') return
    const token = await messaging.getToken() // device specific token to be stored in back-end, check user settings first
    await storeNotificationToken(token)
    messaging.onMessage((payload) => {
      const { data } = payload
      let apiKey = data?.message_3
      if (!apiKey) return
      apiKey = apiKey.split(':')[1]
      const description = (
        <>
          <p className="mb-0">{data.message_1}</p>
          <p className="mb-0">{data.message_2}</p>
          <p className="mb-0">API Key: {apiKey}</p>
        </>
      )
      store.dispatch(notify(description, 'success'))
    })
    navigator.serviceWorker.addEventListener('message', () => {
      // console.log(`Received msg in UC serviceWorker.addEventListener`)
    })
  } catch (e) {
    console.log(e)
  }
}

const fetchSubscriptions = async () => {
  const apiUrl = subscriptionUrl
  return await httpClient(apiUrl, 'GET')
}

const fetchCouponUsed = async () => {
  const apiUrl = `${subscriptionUrl}/coupons_used`
  return await httpClient(apiUrl, 'GET')
}

const fetchStripePlans = async () => {
  const apiUrl = stripePlanUrl
  return await httpClient(apiUrl, 'GET')
}

export {
  getSubscriptionDetails,
  callCloudFunction,
  finishSubscriptionByUser,
  createSubscripton,
  getStripeClientSecret,
  updatePaymentMethod,
  getDefaultPaymentMethod,
  cancelSubscription,
  changeActivePlan,
  verifyCouponCode,
  FCMSubscription,
  fetchSubscriptions,
  fetchCouponUsed,
  fetchStripePlans,
}
