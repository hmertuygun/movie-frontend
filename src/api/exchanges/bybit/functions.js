const getKlines = async ({ symbol, interval, startTime, endTime, limit }) => {
  return new Promise(function (resolve, reject) {
    const url = `${localStorage.getItem(
      'proxyServer'
    )}https://api.bybit.com/public/linear/kline?symbol=${symbol}&interval=${interval}&limit=${limit}&from=${startTime}`

    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
      if (this.status == 200) {
        resolve(JSON.parse(this.response).result)
      }
    }
    xhttp.open('GET', url, true)
    xhttp.send()
  })
}

const editSymbol = ({ symbol }) => {
  return symbol.name.replace('/', '')
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
