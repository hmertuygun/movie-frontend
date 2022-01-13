import axios from 'axios'
import { ccxtClass } from '../../constants/ccxtConfigs'
import { getExchangeProp } from '../../helpers/getExchangeProp'
const EXCHANGE = 'bybit'

const getKlines = async ({ symbol, interval, startTime, endTime, limit }) => {
  let currentSymbol = localStorage.getItem('selectedSymbol').split('/').join('')
  const proxyServer = localStorage.getItem('proxyServer')

  const url = `${proxyServer}https://api.bybit.com/spot/quote/v1/kline?symbol=${currentSymbol}&interval=${interval}${
    startTime ? `&startTime=${startTime}` : ''
  }${endTime ? `&endTime=${endTime}` : ''}${limit ? `&limit=${limit}` : ''}`

  return axios
    .get(url)
    .then((res) => {
      return res.data
    })
    .then((json) => {
      return json.result
    })
    .catch((err) => console.log(err))
}

const fetchTickers = async () => {
  const {
    data: { result },
  } = await axios.get(
    `${localStorage.getItem(
      'proxyServer'
    )}https://api.bybit.com/spot/quote/v1/ticker/24hr`
  )
  return result
}

const editSymbol = ({ symbol }) => {
  return symbol.name.replace('/', '/')
}

const editKline = ({ klines }) => {
  return klines.map((kline) => {
    const [time, open, high, low, close, volume] = kline
    return {
      time: parseInt(time),
      open: parseFloat(open),
      high: parseFloat(high),
      low: parseFloat(low),
      close: parseFloat(close),
      volume: parseFloat(volume),
    }
  })
}

const onSocketMessage = ({ lastMessage }) => {
  if (lastMessage && 'data' in JSON.parse(lastMessage.data)) {
    const a = JSON.parse(lastMessage.data)
    if (a.data.data) {
      return [
        {
          symbol: a.data.data.symbol.replace('-', '/'),
          lastPrice: a.data.data.lastTradedPrice,
          priceChange: a.data.data.changePrice,
          priceChangePercent: a.data.data.changeRate,
          highPrice: a.data.data.high,
          lowPrice: a.data.data.lastTradedPrice,
          volume: a.data.data.vol,
          quoteVolume: a.data.data.volValue,
        },
      ]
    }
  }
}

const editSocketData = ({ o, h, l, v, c, t }) => {
  return {
    close: parseFloat(c),
    open: parseFloat(o),
    high: parseFloat(h),
    low: parseFloat(l),
    volume: parseFloat(v),
    closeTime: t,
    openTime: t,
    time: t,
  }
}

const getSocketEndpoint = () => {
  return new Promise((resolve) =>
    resolve(getExchangeProp('bybit', 'socketEndpoint'))
  )
}

const socketSubscribe = ({ symbolInfo, interval }) => {
  const symbol = symbolInfo.name.replace('/', '')
  const obj = {
    topic: `kline_${interval}`,
    event: 'sub',
    symbol: symbol,
    params: {
      binary: false,
    },
  }
  return { obj, paramStr: { ...obj, event: 'cancel' } }
}

const klineSocketUnsubscribe = ({ param }) => {
  return param
}

const editMessage = (data) => {
  return data.map((sy) => {
    return {
      symbol: sy.symbol.replace('-', '/'),
      lastPrice: sy.last,
      priceChange: sy.changePrice,
      priceChangePercent: sy.changeRate,
      highPrice: sy.high,
      lowPrice: sy.last,
      volume: sy.vol,
      quoteVolume: sy.volValue,
      exchange: 'kucoin',
    }
  })
}

const preparePing = () => {
  return { ping: 1535975085052 }
}

const getIncomingSocket = ({ sData }) => {
  return sData?.data ? sData.data[0] : null
}

const fetchTicker = async ({ symbol }) => {
  const { data } = await axios.get(
    `${localStorage.getItem(
      'proxyServer'
    )}https://api.bybit.com/spot/quote/v1/ticker/24hr?symbol=${symbol.replace(
      '/',
      ''
    )}`
  )
  return {
    last: data.result.lastPrice,
    high: data.result.highPrice,
    low: data.result.lowPrice,
    baseVolume: data.result.volume,
    quoteVolume: data.result.quoteVolume,
    symbol: data.result.symbol,
  }
}

const ByBit = {
  editSymbol,
  editKline,
  onSocketMessage,
  editMessage,
  getKlines,
  editSocketData,
  fetchTickers,
  socketSubscribe,
  fetchTicker,
  klineSocketUnsubscribe,
  preparePing,
  getIncomingSocket,
  getSocketEndpoint,
}

export default ByBit
