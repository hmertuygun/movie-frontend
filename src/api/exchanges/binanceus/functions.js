import { Binance } from '../binance/functions'

const getKlines = async ({ symbol, interval, startTime, endTime, limit }) => {
  const url = `https://cors.bridged.cc/https://api.binance.us/api/v1/klines?symbol=${symbol}&interval=${interval}${
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
        exchange: 'binanceus',
      }
    })
    return marketData
  }
}

const initSubscribe = ({ label }) => {
  return JSON.stringify({
    id: 1,
    method: 'SUBSCRIBE',
    params: ['!ticker@arr'],
  })
}
const fetchTickers = () => {}

const editMessage = () => {}

const BinanceUS = {
  getKlines,
  editSymbol,
  editKline,
  onSocketMessage,
  initSubscribe,
  editMessage,
  fetchTickers,
}

export default BinanceUS
