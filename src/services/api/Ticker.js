import httpClient from 'services/http'
import createQueryString from 'utils/createQueryString'

const fetchExchangeTicker = async (url, symbol) => {
  const apiUrl = `${url}?${createQueryString({ symbol: symbol })}`
  return await httpClient(apiUrl, 'GET')
}

export { fetchExchangeTicker }
