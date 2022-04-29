import httpClient from 'services/http'
import createQueryString from 'utils/createQueryString'

const BASE_URL_V1 = process.env.REACT_APP_API
const BASE_URL_V2 = process.env.REACT_APP_API_V2
const EXCHANGE = `${BASE_URL_V2}exchange`

const getExchanges = async () => {
  const apiUrl = EXCHANGE
  const response = await httpClient(apiUrl, 'GET')
  return response.data
}

const getOneExchange = async (exchange) => {
  const apiUrl = `${EXCHANGE}?${createQueryString({ exchange: exchange })}`
  const response = await httpClient(apiUrl, 'GET')
  return response.data
}

const activateUserExchange = async (exchangeName) => {
  const apiUrl = `${BASE_URL_V1}activateApiKey`
  return await httpClient(apiUrl, 'POST', { apiKeyName: exchangeName })
}

const deleteUserExchange = async ({ name, exchange }) => {
  const params = {
    api: name,
    exchange: exchange,
  }
  const apiUrl = `${BASE_URL_V2}deleteApiKey?${createQueryString(params)}`
  return await httpClient(apiUrl, 'DELETE')
}

const addUserExchange = async (data) => {
  const apiUrl = `${BASE_URL_V2}addApiKey`
  return await httpClient(apiUrl, 'POST', data)
}

const getUserExchanges = async () => {
  const apiUrl = `${BASE_URL_V1}loadApiKeys`
  return await httpClient(apiUrl, 'GET')
}

const updateUserExchange = async (data) => {
  const apiUrl = `${BASE_URL_V2}updateApiKey`
  return await httpClient(apiUrl, 'PATCH', data)
}

export {
  getExchanges,
  getOneExchange,
  activateUserExchange,
  deleteUserExchange,
  addUserExchange,
  getUserExchanges,
  updateUserExchange,
}
