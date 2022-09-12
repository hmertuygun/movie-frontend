import { API_URLS } from 'constants/config'
import httpClient from 'services/http'

const apiKeyUrl = API_URLS['api-key']

const fetchApiKeys = async () => {
  const apiUrl = apiKeyUrl
  return await httpClient(apiUrl, 'GET')
}

const updateApiKeys = async (data) => {
  const apiUrl = apiKeyUrl
  return await httpClient(apiUrl, 'PATCH', data)
}

export { fetchApiKeys, updateApiKeys }
