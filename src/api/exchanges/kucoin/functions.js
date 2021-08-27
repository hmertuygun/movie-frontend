const getKlines = async ({ symbol, interval, startTime, endTime, limit }) => {
  const url = `https://nodejs-cors.herokuapp.com/https://api.kucoin.com/api/v1/market/candles?type=${interval}&symbol=${symbol}&startAt=${
    startTime / 1000
  }&endAt=${endTime / 1000}`
  console.log(url)
  return fetch(url)
    .then((res) => {
      return res.json()
    })
    .then((json) => {
      return json.data
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

const initSubscribe = ({ label }) => {
  return JSON.stringify({
    id: Date.now(),
    type: 'subscribe',
    topic: `/market/snapshot:${label}`,
    response: true,
  })
}

const getSocketEndpoint = () => {
  return new Promise(async (resolve) => {
    const token = localStorage.getItem('kucoinEndpoint')
    if (token) {
      let { endpoint, date } = JSON.parse(token)
      var diffMins = (new Date() - new Date(date)) / 1000 / 60
      if (endpoint && diffMins < 600) {
        resolve(
          `wss://ws-api.kucoin.com/endpoint?token=${endpoint}&[connectId=${Date.now()}]`
        )
      } else {
        const client = new XMLHttpRequest()
        client.open(
          'POST',
          'https://nodejs-cors.herokuapp.com/https://api.kucoin.com/api/v1/bullet-public'
        )
        client.send()

        client.onload = () => {
          const { data } = JSON.parse(client.responseText)
          if (data?.token) {
            let newToken = data.token
            localStorage.setItem(
              'kucoinEndpoint',
              JSON.stringify({ endpoint: newToken, date: new Date().getTime() })
            )
            resolve(
              `wss://ws-api.kucoin.com/endpoint?token=${newToken}&[connectId=${Date.now()}]`
            )
          }
        }
      }
    } else {
      const client = new XMLHttpRequest()
      client.open(
        'POST',
        'https://nodejs-cors.herokuapp.com/https://api.kucoin.com/api/v1/bullet-public'
      )
      client.send()

      client.onload = () => {
        const { data } = JSON.parse(client.responseText)
        if (data?.token) {
          let newToken = data.token
          localStorage.setItem(
            'kucoinEndpoint',
            JSON.stringify({ endpoint: newToken, date: new Date().getTime() })
          )
          resolve(
            `wss://ws-api.kucoin.com/endpoint?token=${newToken}&[connectId=${Date.now()}]`
          )
        }
      }
    }
  })
}
const KuCoin = {
  getKlines,
  editSymbol,
  editKline,
  onSocketMessage,
  initSubscribe,
  getSocketEndpoint,
}

export default KuCoin
