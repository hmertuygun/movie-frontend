import httpClient from 'services/http'

const BASE_URL = process.env.REACT_APP_API

const connectTelegramLoadKey = async () => {
  const apiUrl = `${BASE_URL}connectTelegramLoadKey`
  const response = await httpClient(apiUrl, 'GET')
  return response.data
}

const disconnectTelegram = async () => {
  const apiUrl = `${BASE_URL}disconnectTelegram`
  const response = await httpClient(apiUrl, 'POST')
  return response.data
}

export { connectTelegramLoadKey, disconnectTelegram }
