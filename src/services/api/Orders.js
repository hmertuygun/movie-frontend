import httpClient from 'services/http'
import capitalize from 'utils/capitalizeFirstLetter'
import createQueryString from 'utils/createQueryString'

const BASE_URL_V1 = process.env.REACT_APP_API
const BASE_URL_V2 = process.env.REACT_APP_API_V2

const placeOrder = async ({
  entry,
  targets,
  stoploss,
  apiKeyName,
  exchange,
}) => {
  const newTargets = targets.map((target, index) => {
    const { side, type, symbol, quantity, price, triggerPrice } = target
    return {
      targetNumber: index + 1,
      percentage: (target.quantity / entry.quantity) * 100,
      quantity,
      side,
      type,
      symbol,
      trigger: triggerPrice,
      price,
    }
  })
  const newStoploss = stoploss.map((stoploss) => {
    const { side, type, symbol, quantity, triggerPrice, price } = stoploss
    return {
      side,
      type,
      symbol,
      quantity,
      trigger: triggerPrice,
      price,
      percentage: (stoploss.quantity / entry.quantity) * 100,
    }
  })
  const data = {
    entryOrder: entry,
    targets: newTargets,
    stopLoss: { ...newStoploss[0] },
    exchange: exchange,
    apiKeyName: apiKeyName,
  }
  const apiUrl = `${BASE_URL_V2}createFullTrade`
  return await httpClient(apiUrl, 'POST', data)
}

const getOpenOrders = async ({
  timestamp,
  limit,
  trade_id,
  apiKeyName,
  exchange,
}) => {
  const params = {
    apiKeyName: apiKeyName,
    exchange: capitalize(exchange),
    limit: limit || 50,
  }
  if (timestamp) params['timestamp'] = timestamp
  if (trade_id) params['trade_id'] = trade_id
  let apiUrl = `${BASE_URL_V2}orders?${createQueryString(params)}`
  const response = await httpClient(apiUrl, 'GET')
  return response.data
}

const cancelTradeOrder = async ({ trade_id, symbol, apiKeyName, exchange }) => {
  const params = {
    exchange: exchange,
    apiKeyName: apiKeyName,
  }
  const apiUrl = `${BASE_URL_V2}trade/cancel?${createQueryString(params)}`
  return await httpClient(apiUrl, 'POST', {
    trade_id,
    symbol,
  })
}

const getOrdersHistory = async ({
  updateTime,
  symbol,
  orderId,
  apiKeyName,
  exchange,
}) => {
  const params = {
    limit: 50,
    apiKeyName: apiKeyName,
    exchange: capitalize(exchange),
  }
  if (updateTime) params['updateTime'] = parseInt(updateTime)
  if (symbol) params['symbol'] = symbol
  if (orderId) params['orderId'] = orderId
  const apiUrl = `${BASE_URL_V2}orderhistory?${createQueryString(params)}`
  const response = await httpClient(apiUrl, 'GET')
  return response.data
}

const editOrder = async (payload) => {
  const apiUrl = `${BASE_URL_V1}orders`
  const response = await httpClient(apiUrl, 'PATCH', { ...payload })
  return response?.data
}

const createBasicTrade = async (payload) => {
  const apiUrl = `${BASE_URL_V2}createBasicTrade`
  return await httpClient(apiUrl, 'POST', payload)
}

export {
  placeOrder,
  getOpenOrders,
  cancelTradeOrder,
  getOrdersHistory,
  editOrder,
  createBasicTrade,
}
