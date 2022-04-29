const socketSubscribe = (symbol, interval) => {
  const activeSymbol = symbol.replace('/', '').toLowerCase()
  const paramStr = `market.${activeSymbol}.kline.${interval}`
  const obj = {
    sub: paramStr,
    id: 'id1',
  }
  return { obj, paramStr }
}

const klineSocketUnsubscribe = (param) => {
  return {
    unsub: param,
    id: 'id1',
  }
}

const getTickerData = (data) => {
  const result = {
    last: data.lastPrice,
    change: null,
    percentage: null,
    high: data.high,
    low: data.low,
    baseVolume: data.amount,
    quoteVolume: data.vol,
    symbol: null,
  }
  return result
}

const editSocketData = (params) => {
  const { open, close, high, low, volume, id } = params
  return {
    time: parseInt(id) * 1000,
    open: parseFloat(open),
    high: parseFloat(high),
    low: parseFloat(low),
    close: parseFloat(close),
    volume: parseFloat(volume),
    openTime: parseInt(id),
  }
}

const getIncomingSocket = (sData) => {
  return { ...sData.tick, topic: sData.ch }
}

const tickerSocketSubscribe = (symbol) => {
  return {
    sub: `market.${symbol.replace('/', '').toLowerCase()}.ticker`,
  }
}

const getLastAndPercent = (data) => {
  return {
    last: data.lastPrice,
    percentage: ((data.close - data.open) / data.close) * 100,
  }
}

const HuobiPro = {
  socketSubscribe,
  klineSocketUnsubscribe,
  getTickerData,
  editSocketData,
  getIncomingSocket,
  tickerSocketSubscribe,
  getLastAndPercent,
}

export default HuobiPro
