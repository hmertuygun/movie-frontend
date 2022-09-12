import { API_URLS } from 'constants/config'
import httpClient from 'services/http'

const analystUrl = API_URLS['analyst']

const fetchAllAnalysts = async () => {
  const apiUrl = analystUrl
  return await httpClient(apiUrl, 'GET')
}

const fetchAnalystDrawings = async (email) => {
  const apiUrl = `${analystUrl}/drawings/${email}`
  return await httpClient(apiUrl, 'GET')
}

const fetchAnalystAllDrawings = async () => {
  const apiUrl = `${analystUrl}/all_drawings`
  return await httpClient(apiUrl, 'GET')
}

const fetchAnalystFlags = async (email) => {
  const apiUrl = `${analystUrl}/flags/${email}`
  return await httpClient(apiUrl, 'GET')
}

const updateAnalystDrawings = async (email, data) => {
  const apiUrl = `${analystUrl}/drawings/${email}`
  return await httpClient(apiUrl, 'PATCH', data)
}

const updateAnalystFlags = async (email, data) => {
  const apiUrl = `${analystUrl}/flags/${email}`
  return await httpClient(apiUrl, 'PATCH', data)
}

export {
  fetchAllAnalysts,
  fetchAnalystDrawings,
  fetchAnalystAllDrawings,
  fetchAnalystFlags,
  updateAnalystDrawings,
  updateAnalystFlags,
}
