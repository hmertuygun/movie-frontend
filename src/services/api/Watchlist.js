import { API_URLS } from 'constants/config'
import httpClient from 'services/http'

const watchlistUrl = API_URLS['watchlist']

const fetchWatchList = async (email) => {
  const apiUrl = `${watchlistUrl}${email ? '/' + email : ''}`
  return await httpClient(apiUrl, 'GET')
}

const updateWatchList = async (data) => {
  const apiUrl = watchlistUrl
  return await httpClient(apiUrl, 'PATCH', data)
}

const deleteWatchLists = async (data) => {
  const apiUrl = watchlistUrl
  return await httpClient(apiUrl, 'DELETE', data)
}

export { fetchWatchList, updateWatchList, deleteWatchLists }
