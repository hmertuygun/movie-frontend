import { ccxtClass } from '../../constants/ccxtConfigs'
import { getExchangeProp } from '../../helpers/getExchangeProp'
import pako from 'pako'
const EXCHANGE = 'huobipro'

const getKlines = async ({ symbol, interval, startTime, endTime, limit }) => {
  try {
    const data = await ccxtClass[EXCHANGE].fetchOHLCV(symbol, interval)
    return data
  } catch (error) {
    console.log('bad symbol')
  }
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

const editSocketData = (getData) => {
  const { open, close, high, low, volume, id } = getData

  let lastSocketData = {
    time: parseInt(id) * 1000,
    open: parseFloat(open),
    high: parseFloat(high),
    low: parseFloat(low),
    close: parseFloat(close),
    volume: parseFloat(volume),
    openTime: parseInt(id),
  }
  return lastSocketData
}

const initSubscribe = ({ label }) => {
  return JSON.stringify({
    id: Date.now(),
    type: 'subscribe',
    topic: `/market/snapshot:${label}`,
    response: true,
  })
}
//using proxy
const fetchTickers = () => {
  return new Promise(async (resolve) => {
    resolve(await ccxtClass[EXCHANGE].fetchTickers())
  })
}

const preparePing = () => {
  return {
    action: 'ping',
    data: {
      ts: 1575537778295,
    },
  }
}

const socketSubscribe = ({ symbolInfo, interval }) => {
  const symbol = symbolInfo.name.replace('/', '')
  let paramStr = `market.${symbol.toLowerCase()}.kline.${interval}`

  const obj = {
    sub: paramStr,
    id: 'id1',
  }
  return { obj, paramStr }
}

const klineSocketUnsubscribe = ({ param }) => {
  return {
    unsub: param,
    id: 'id1',
  }
}

const getSocketEndpoint = () => {
  return new Promise((resolve) =>
    resolve(getExchangeProp('huobipro', 'socketEndpoint'))
  )
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

const resolveGzip = (data) => {
  return new Promise((resolve) => {
    var reader = new FileReader()
    reader.onload = function (event) {
      var result = pako.inflate(event.target.result, { to: 'string' })
      resolve(JSON.parse(result))
    }
    reader.readAsArrayBuffer(data)
  })
}

const getIncomingSocket = ({ sData }) => {
  return { ...sData.tick, topic: sData.ch }
}

const fetchTicker = async ({ symbol }) => {
  return await ccxtClass[EXCHANGE].fetchTicker(symbol)
}

const ticketSocketSubscribe = (symbol) => {
  return JSON.stringify({
    sub: `market.${symbol.replace('/', '').toLowerCase()}.ticker`,
  })
}

const getTickerData = (data) => {
  return {
    last: data.lastPrice,
    change: null,
    percentage: null,
    high: data.high,
    low: data.low,
    baseVolume: data.amount,
    quoteVolume: data.vol,
    symbol: null,
  }
}

const getLastAndPercent = ({ data }) => {
  return {
    last: data.lastPrice,
    percentage: ((data.close - data.open) / data.close) * 100,
  }
}

const Huobi = {
  getKlines,
  editSymbol,
  editKline,
  onSocketMessage,
  initSubscribe,
  fetchTicker,
  getSocketEndpoint,
  fetchTickers,
  editSocketData,
  editMessage,
  klineSocketUnsubscribe,
  socketSubscribe,
  preparePing,
  getIncomingSocket,
  ticketSocketSubscribe,
  resolveGzip,
  getTickerData,
  getLastAndPercent,
}

export default Huobi
