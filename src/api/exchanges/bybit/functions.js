import axios from 'axios'

const getKlines = async ({ symbol, interval, startTime, endTime, limit }) => {
  let currentSymbol = localStorage.getItem('selectedSymbol').split('/').join('')

  const url = `${localStorage.getItem(
    'proxyServer'
  )}https://api.bybit.com/spot/quote/v1/kline?symbol=${currentSymbol}&interval=${interval}${
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

const ByBit = {
  editSymbol,
  editKline,
  onSocketMessage,
  editMessage,
  getKlines,
}

export default ByBit
