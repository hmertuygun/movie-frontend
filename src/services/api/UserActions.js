import httpClient from 'services/http'

const BASE_URL = process.env.REACT_APP_USER_ACTIONS_API
const BASE_V2_URL = process.env.REACT_APP_API_V2

const sendLoginInfo = async () => {
  const apiUrl = `${BASE_URL}`
  const payload = { action: 'login' }

  const response = await httpClient(apiUrl, 'POST', payload)
  return response.data
}

const getUserDetails = async () => {
  const apiUrl = `${BASE_V2_URL}user`
  return await httpClient(apiUrl, 'GET')
}

const sendOrderInfo = async (data) => {
  const apiUrl = `${BASE_URL}`
  const payload = { action: 'order', ...data }

  const response = await httpClient(apiUrl, 'POST', payload)
  return response.data
}

export { sendLoginInfo, getUserDetails, sendOrderInfo }
