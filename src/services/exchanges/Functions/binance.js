const socketSubscribe = (symbol, interval) => {
  const activeSymbol = symbol.replace('/', '').toLowerCase()
  const paramStr = `${activeSymbol}@kline_${interval}`
  const obj = {
    method: 'SUBSCRIBE',
    params: [paramStr],
    id: 1,
  }
  return { obj, paramStr }
}

const getIncomingSocket = (sData) => {
  return sData.k
}

const Binance = { socketSubscribe, getIncomingSocket }

export default Binance
