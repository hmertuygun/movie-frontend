import httpClient from 'services/http'

const BASE_URL = process.env.REACT_APP_API_V2
const PRICE_ALERT = `${BASE_URL}PriceAlert`

const createPriceAlert = async (data) => {
  const apiUrl = `${PRICE_ALERT}/create`
  const response = await httpClient(apiUrl, 'POST', data)
  return response?.data
}

const updatePriceAlert = async (id, data) => {
  const apiUrl = `${PRICE_ALERT}/update/${id}`
  const response = await httpClient(apiUrl, 'POST', data)
  return response?.data
}

const getPriceAlerts = async () => {
  const apiUrl = `${PRICE_ALERT}/list`
  const response = await httpClient(apiUrl, 'GET')
  return response?.data
}

const deletePriceAlert = async (id) => {
  const apiUrl = `${PRICE_ALERT}/delete/${id}`
  const response = await httpClient(apiUrl, 'DELETE')
  return response?.data
}

const reactivatePriceAlert = async (id) => {
  const apiUrl = `${PRICE_ALERT}/reactive/${id}`
  const response = await httpClient(apiUrl, 'POST')
  return response?.data
}

export {
  createPriceAlert,
  updatePriceAlert,
  getPriceAlerts,
  deletePriceAlert,
  reactivatePriceAlert,
}
