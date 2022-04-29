import { ccxtClass } from 'constants/ccxtConfigs'

const socketSubscribe = (symbol, interval) => {
  const activeSymbol = symbol.replace('/', '-')
  const obj = {
    op: 'subscribe',
    args: [
      {
        channel: interval,
        instId: `${activeSymbol}`,
      },
    ],
  }
  return { obj, paramStr: `${activeSymbol}/${interval}` }
}

const klineSocketUnsubscribe = (param) => {
  const [symbol, channel] = param.split('/')
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

const getTickerData = (data) => {
  const result = {
    last: data.c,
    change: null,
    percentage: data.m,
    high: data.h,
    low: data.l,
    baseVolume: data.v,
    quoteVolume: data.qv,
    symbol: data.s,
  }
  return result
}

const editSocketData = (params) => {
  const [t, o, h, l, c, v] = params
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

const getIncomingSocket = (sData) => (sData?.data ? sData.data[0] : null)

const tickerSocketSubscribe = (params) => {
  const { symbol, interval } = params
  return {
    op: 'unsubscribe',
    args: [
      {
        channel: interval,
        instId: `${symbol}`,
      },
    ],
  }
}

const getLastAndPercent = (data) => {
  return {
    last: data.last,
    percentage: ((data.close - data.open) / data.close) * 100,
  }
}

const fetchOHLCV = async (data) => {
  const { symbol, interval, startTime, limit } = data
  return await ccxtClass['okex'].fetchOHLCV(symbol, interval, startTime, limit)
}

const Okex = {
  socketSubscribe,
  getTickerData,
  editSocketData,
  klineSocketUnsubscribe,
  getIncomingSocket,
  tickerSocketSubscribe,
  getLastAndPercent,
  fetchOHLCV,
}

export default Okex
