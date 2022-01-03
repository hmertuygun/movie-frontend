import { ccxtClass } from '../../constants/ccxtConfigs'
import { getExchangeProp } from '../../helpers/getExchangeProp'
const EXCHANGE = 'binance'

const getKlines = async ({ symbol, interval, startTime, endTime, limit }) => {
  let currentSymbol = localStorage.getItem('selectedSymbol').split('/').join('')
  if (symbol === currentSymbol) {
    const url = `https://api2.binance.com/api/v1/klines?symbol=${symbol}&interval=${interval}${
      startTime ? `&startTime=${startTime}` : ''
    }${endTime ? `&endTime=${endTime}` : ''}${limit ? `&limit=${limit}` : ''}`

    return fetch(url)
      .then((res) => {
        return res.json()
      })
      .then((json) => {
        return json
      })
  }
}

const editSymbol = ({ symbol }) => {
  return symbol.name.replace('/', '')
}

const editKline = ({ klines }) => {
  return klines.map((kline) => ({
    time: parseInt(kline[0]),
    open: parseFloat(kline[1]),
    high: parseFloat(kline[2]),
    low: parseFloat(kline[3]),
    close: parseFloat(kline[4]),
    volume: parseFloat(kline[5]),
  }))
}

const onSocketMessage = ({ lastMessage }) => {
  if (lastMessage && 'data' in JSON.parse(lastMessage.data)) {
    const marketData = JSON.parse(lastMessage.data).data.map((item) => {
      return {
        symbol: item.s,
        lastPrice: item.c,
        priceChange: item.p,
        priceChangePercent: item.P,
        highPrice: item.h,
        lowPrice: item.l,
        volume: item.v,
        quoteVolume: item.q,
        exchange: 'binance',
      }
    })
    return marketData
  }
}

const editSocketData = ({ o, h, l, v, c, T, t }) => {
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

const socketSubscribe = ({ symbolInfo, interval }) => {
  const symbol = symbolInfo.name.replace('/', '')
  let paramStr = `${symbol.toLowerCase()}@kline_${interval}`
  const obj = {
    method: 'SUBSCRIBE',
    params: [paramStr],
    id: 1,
  }
  return { obj, paramStr }
}

const klineSocketUnsubscribe = ({ param }) => {
  const obj = {
    method: 'UNSUBSCRIBE',
    params: [param],
    id: 1,
  }
  return obj
}

const getSocketEndpoint = () => {
  return new Promise((resolve) =>
    resolve(getExchangeProp('binance', 'socketEndpoint'))
  )
}

const initSubscribe = ({ label }) => {
  return JSON.stringify({
    id: 1,
    method: 'SUBSCRIBE',
    params: ['!ticker@arr'],
  })
}

const fetchTickers = () => {}

const fetchTicker = async ({ symbol }) => {
  return await ccxtClass[EXCHANGE].fetchTicker(symbol)
}

const editMessage = () => {}

const getIncomingSocket = ({ sData }) => {
  return sData.k
}

const Binance = {
  getKlines,
  editSymbol,
  editKline,
  onSocketMessage,
  initSubscribe,
  editMessage,
  fetchTickers,
  editSocketData,
  klineSocketUnsubscribe,
  socketSubscribe,
  getIncomingSocket,
  getSocketEndpoint,
  fetchTicker,
}

export default Binance
