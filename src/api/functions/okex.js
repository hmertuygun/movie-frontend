import { ccxtClass } from '../../constants/ccxtConfigs'
import { getExchangeProp } from '../../helpers/getExchangeProp'
const EXCHANGE = 'okex'

const getKlines = async ({ symbol, interval, startTime, endTime, limit }) => {
  try {
    const data = await ccxtClass[EXCHANGE].fetchOHLCV(
      symbol,
      interval,
      startTime,
      limit
    )
    return data
  } catch (error) {
    console.log('bad symbol')
  }
}

const fetchTickers = async () => {
  return new Promise(async (resolve) => {
    resolve(await ccxtClass[EXCHANGE].fetchTickers())
  })
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

const editSocketData = ([t, o, h, l, c, v]) => {
  return {
    close: parseFloat(c),
    open: parseFloat(o),
    high: parseFloat(h),
    low: parseFloat(l),
    volume: parseFloat(v),
    closeTime: Number(t),
    openTime: Number(t),
    time: Number(t),
  }
}

const getSocketEndpoint = () => {
  return new Promise((resolve) =>
    resolve(getExchangeProp('okex', 'socketEndpoint'))
  )
}

const socketSubscribe = ({ symbolInfo, interval }) => {
  const symbol = symbolInfo.name.replace('/', '-')
  const obj = {
    op: 'subscribe',
    args: [
      {
        channel: interval,
        instId: `${symbol}`,
      },
    ],
  }
  return { obj, paramStr: `${symbol}/${interval}` }
}

const klineSocketUnsubscribe = ({ param }) => {
  let [symbol, channel] = param.split('/')
  return {
    op: 'unsubscribe',
    args: [
      {
        channel,
        instId: `${symbol}`,
      },
    ],
  }
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
      exchange: 'okex',
    }
  })
}

const preparePing = () => {
  return { ping: 1535975085052 }
}

const getIncomingSocket = ({ sData }) => {
  return sData?.data ? sData?.data[0] : {}
}

const fetchTicker = async ({ symbol }) => {
  return await ccxtClass[EXCHANGE].fetchTicker(symbol)
}

const ticketSocketSubscribe = ({ symbol, interval }) => {
  return JSON.stringify({
    op: 'unsubscribe',
    args: [
      {
        channel: interval,
        instId: `${symbol}`,
      },
    ],
  })
}

const getTickerData = (data) => {
  return {
    last: data.c,
    change: null,
    percentage: data.m,
    high: data.h,
    low: data.l,
    baseVolume: data.v,
    quoteVolume: data.qv,
    symbol: data.s,
  }
}

const getLastAndPercent = ({ data }) => {
  return {
    last: data.last,
    percentage: ((data.open - data.close) / data.close) * 100,
  }
}

const OKEx = {
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
  ticketSocketSubscribe,
  getTickerData,
  getLastAndPercent,
}

export default OKEx
