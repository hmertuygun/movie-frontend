const socketSubscribe = (symbol, interval) => {
  const activeSymbol = symbol.replace('/', '')
  const obj = {
    topic: `kline_${interval}`,
    event: 'sub',
    symbol: activeSymbol,
    params: {
      binary: false,
    },
  }
  const paramStr = JSON.stringify(obj)
  return { obj, paramStr }
}

const klineSocketUnsubscribe = (param) => {
  const obj = JSON.parse(param)
  obj.event = 'cancel'
  return obj
}

const getIncomingSocket = (sData) => (sData?.data ? sData.data[0] : null)

const tickerSocketSubscribe = (symbol) => {
  return {
    topic: 'realtimes',
    event: 'sub',
    symbol: symbol.replace('/', ''),
    params: {
      binary: false,
    },
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

const getLastAndPercent = (data) => {
  return {
    last: data.c,
    percentage: data.m,
  }
}

const editSocketData = (params) => {
  const { o, h, l, v, c, t } = params
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

const Bybit = {
  socketSubscribe,
  klineSocketUnsubscribe,
  getIncomingSocket,
  tickerSocketSubscribe,
  getTickerData,
  getLastAndPercent,
  editSocketData,
}

export default Bybit
