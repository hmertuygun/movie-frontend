import { API_URLS } from 'constants/config'
import httpClient from 'services/http'

const chartUrl = API_URLS['chart']
const drawingUrl = `${chartUrl}/drawings`

const saveLastSelectedMarketSymbol = async (symbol) => {
  const apiUrl = `${chartUrl}/lastSelectedSymbol`
  const response = await httpClient(apiUrl, 'POST', {
    lastSelectedSymbol: symbol,
  })
  return response?.data
}

const saveTimeZone = async (timezone) => {
  const apiUrl = `${chartUrl}/timezone`
  const response = await httpClient(apiUrl, 'POST', { timeZone: timezone })
  return response?.data
}

const saveChartIntervals = async (cIntervals) => {
  const apiUrl = `${chartUrl}/interval`
  const response = await httpClient(apiUrl, 'POST', { intervals: cIntervals })
  return response?.data?.intervals || []
}

const getChartMetaInfo = async () => {
  const apiUrl = chartUrl
  return await httpClient(apiUrl, 'GET')
}

const getChartDrawings = async () => {
  const apiUrl = drawingUrl
  return await httpClient(apiUrl, 'GET')
}

const updateDrawings = async (data) => {
  const apiUrl = chartUrl
  return await httpClient(apiUrl, 'PATCH', data)
}

const backupDrawings = async (data) => {
  const apiUrl = `${drawingUrl}/backup`
  return await httpClient(apiUrl, 'PATCH', data)
}

export {
  saveLastSelectedMarketSymbol,
  saveTimeZone,
  saveChartIntervals,
  getChartMetaInfo,
  getChartDrawings,
  updateDrawings,
  backupDrawings,
}
