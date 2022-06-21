import httpClient from 'services/http'
import capitalize from 'utils/capitalizeFirstLetter'
import createQueryString from 'utils/createQueryString'

const BASE_URL = process.env.REACT_APP_PORTFOLIO_API

const getPortfolio = async (payload, skipCache) => {
  let params = {}
  if (skipCache) params['skip_cache'] = true

  const apiUrl = `${BASE_URL}balance?${createQueryString(params)}`
  return await httpClient(apiUrl, 'POST', payload)
}

const getBalance = async ({ symbol, apiKeyName, exchange, skipCache }) => {
  const params = {
    api_key: apiKeyName,
    exchange: capitalize(exchange),
  }
  if (skipCache) params['skip_cache'] = true

  const apiUrl = `${BASE_URL}balance/${symbol}?${createQueryString(params)}`
  return await httpClient(apiUrl, 'GET')
}

const getLastPrice = async (symbol, exchange) => {
  symbol = symbol.replace('/', '-')
  const params = {
    symbol: symbol,
    exchange: exchange,
  }
  const apiUrl = `${BASE_URL}last_price?${createQueryString(params)}`
  return await httpClient(apiUrl, 'GET')
}

export { getBalance, getLastPrice, getPortfolio }
