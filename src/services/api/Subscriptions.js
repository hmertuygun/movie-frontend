import httpClient from 'services/http'

const BASE_URL = process.env.REACT_APP_API_SUBSCRIPTION
const PROJECT_ID = process.env.REACT_APP_FIREBASE_PROJECT_ID

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
}
