import { ccxtClass } from 'constants/ccxtConfigs'

const socketSubscribe = (symbol, interval) => {
  const obj = {
    event: 'subscribe',
    pair: [symbol],
    subscription: {
      interval: interval,
      name: 'ohlc',
    },
  }

  return { obj, paramStr: `${symbol}-${interval}` }
}

const klineSocketUnsubscribe = (param) => {
  const [symbol, channel] = param.split('-')

  return {
    event: 'unsubscribe',
    pair: [symbol],
    subscription: {
      name: 'ohlc',
      interval: Number(channel),
    },
  }
}

const editSocketData = (params) => {
  const [t, et, o, h, l, c, vw, v, co] = params
  return {
    close: parseFloat(c),
    open: parseFloat(o),
    high: parseFloat(h),
    low: parseFloat(l),
    volume: parseFloat(v),
    openTime: parseInt(et),
    time: parseInt(et),
  }
}

const getIncomingSocket = (sData) => {
  return sData[2] ? sData[1] : null
}

const getLastAndPercent = (data) => {
  return {
    last: data.last,
    percentage: ((data.close - data.open) / data.close) * 100,
  }
}

const fetchOHLCV = async (data) => {
  const { symbol, interval, startTime, limit } = data
  return await ccxtClass['kraken'].fetchOHLCV(
    symbol,
    interval,
    startTime,
    limit
  )
}

const Kraken = {
  socketSubscribe,
  editSocketData,
  klineSocketUnsubscribe,
  getIncomingSocket,
  getLastAndPercent,
  fetchOHLCV,
}

export default Kraken
