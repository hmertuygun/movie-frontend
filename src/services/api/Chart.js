import httpClient from 'services/http'

const BASE_URL = process.env.REACT_APP_API
const CHART = `${BASE_URL}chart`

const saveLastSelectedMarketSymbol = async (symbol) => {
  const apiUrl = `${CHART}/lastSelectedSymbol`
  const response = await httpClient(apiUrl, 'POST', {
    lastSelectedSymbol: symbol,
  })
  return response?.data
}

const saveTimeZone = async (timezone) => {
  const apiUrl = `${CHART}/timezone`
  const response = await httpClient(apiUrl, 'POST', { timeZone: timezone })
  return response?.data
}

const saveChartIntervals = async (cIntervals) => {
  const apiUrl = `${CHART}/interval`
  const response = await httpClient(apiUrl, 'POST', { intervals: cIntervals })
  return response?.data?.intervals || []
}

export { saveLastSelectedMarketSymbol, saveTimeZone, saveChartIntervals }
