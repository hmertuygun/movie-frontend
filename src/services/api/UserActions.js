import { API_URLS, USER_ACTION_URL } from 'constants/config'
import httpClient from 'services/http'

const userDataUrl = API_URLS['user-data']
const userUrl = API_URLS['user']
const referralUrl = API_URLS['referrals']
const stripeUsersUrl = API_URLS['stripe-users']

const sendLoginInfo = async () => {
  const apiUrl = USER_ACTION_URL
  const response = await httpClient(apiUrl, 'POST', { action: 'login' })
  return response.data
}

const getUserDetails = async () => {
  const apiUrl = userUrl
  return await httpClient(apiUrl, 'GET')
}

const fetchUsersData = async () => {
  const apiUrl = userDataUrl
  return await httpClient(apiUrl, 'GET')
}

const updateUsersData = async (data) => {
  const apiUrl = userDataUrl
  return await httpClient(apiUrl, 'PATCH', data)
}

const updateInitialUsersData = async (data) => {
  const apiUrl = userDataUrl
  return await httpClient(apiUrl, 'POST', data)
}

const fetchReferrals = async () => {
  const apiUrl = referralUrl
  return await httpClient(apiUrl, 'GET')
}

const updateReferrals = async (data) => {
  const apiUrl = referralUrl
  return await httpClient(apiUrl, 'PATCH', data)
}

const updateStripeUsers = async (data) => {
  const apiUrl = stripeUsersUrl
  return await httpClient(apiUrl, 'PATCH', data)
}

const sendOrderInfo = async (data) => {
  const apiUrl = `${USER_ACTION_URL}`
  const payload = { action: 'order', ...data }

  const response = await httpClient(apiUrl, 'POST', payload)
  return response.data
}

export {
  sendLoginInfo,
  getUserDetails,
  fetchUsersData,
  updateUsersData,
  updateInitialUsersData,
  fetchReferrals,
  updateReferrals,
  updateStripeUsers,
  sendOrderInfo,
}
