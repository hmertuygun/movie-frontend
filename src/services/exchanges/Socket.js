import { EXCHANGE_OPTIONS } from 'constants/ExchangesList'
import { getExchangeFunction } from 'utils/exchangeSelection'

const socketSubscribe = (exchange, { symbol, interval }) => {
  const socketSubscribeFunc = getExchangeFunction(exchange, 'socketSubscribe')
  if (socketSubscribeFunc) return socketSubscribeFunc(symbol, interval)
}

const editSocketData = (exchange, params) => {
  const editSocketDataFunc = getExchangeFunction(exchange, 'editSocketData')
  if (editSocketDataFunc) return editSocketDataFunc(params)
  else {
    const { o, h, l, v, c, T, t } = params
    return {
      time: t,
      close: parseFloat(c),
      open: parseFloat(o),
      high: parseFloat(h),
      low: parseFloat(l),
      volume: parseFloat(v),
      closeTime: T,
      openTime: t,
    }
  }
}

const getIncomingSocket = async (exchange, sData) => {
  const getIncomingSocketFunc = getExchangeFunction(
    exchange,
    'getIncomingSocket'
  )
  if (getIncomingSocketFunc) return await getIncomingSocketFunc(sData)
}

const getSocketEndpoint = async (exchange) => {
  const getSocketEndpointFunc = getExchangeFunction(
    exchange,
    'getSocketEndpoint'
  )
  if (getSocketEndpointFunc) return getSocketEndpointFunc()
  return new Promise(async (resolve) => {
    resolve(EXCHANGE_OPTIONS[exchange]['socketEndpoint'])
  })
}

const klineSocketUnsubscribe = (exchange, param) => {
  const klineSocketUnsubscribeFunc = getExchangeFunction(
    exchange,
    'klineSocketUnsubscribe'
  )
  if (klineSocketUnsubscribeFunc) return klineSocketUnsubscribeFunc(param)
  return {
    method: 'UNSUBSCRIBE',
    params: [param],
    id: 1,
  }
}

const tickerSocketSubscribe = (exchange, params) => {
  const tickerSocketSubscribeFunc = getExchangeFunction(
    exchange,
    'tickerSocketSubscribe'
  )
  if (tickerSocketSubscribeFunc)
    return JSON.stringify(tickerSocketSubscribeFunc(params))
}

export {
  socketSubscribe,
  editSocketData,
  getIncomingSocket,
  getSocketEndpoint,
  klineSocketUnsubscribe,
  tickerSocketSubscribe,
}
