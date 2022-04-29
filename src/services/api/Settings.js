import httpClient from 'services/http'
import createQueryString from 'utils/createQueryString'

const BASE_URL = process.env.REACT_APP_API
const POSITION_API = process.env.REACT_APP_POSITION_API

const updateLastSelectedAPIKey = async ({ apiKeyName, exchange }) => {
  const params = {
    apiKeyName: apiKeyName,
    exchange: exchange,
  }
  const apiUrl = `${BASE_URL}updateLastSelectedApiKey?${createQueryString(
    params
  )}`
  return await httpClient(apiUrl, 'POST')
}

const getPositionsList = async ({ apiKeyName, exchange }) => {
  const params = {
    apiKeyName: apiKeyName,
    exchange: exchange,
  }
  const apiUrl = `${POSITION_API}list?${createQueryString(params)}`
  return await httpClient(apiUrl, 'GET')
}

const dismissNotice = async (notice_id) => {
  const apiUrl = `${BASE_URL}notice`
  const response = await httpClient(apiUrl, 'POST', { notice_id })
  return response?.data
}

export { updateLastSelectedAPIKey, getPositionsList, dismissNotice }
