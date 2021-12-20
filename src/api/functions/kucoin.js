import { ccxtClass } from '../../constants/ccxtConfigs'
const EXCHANGE = 'kucoin'

const getKlines = async ({ symbol, interval, startTime, endTime, limit }) => {
  try {
    const data = await ccxtClass[EXCHANGE].fetchOHLCV(symbol, interval)
    return data
  } catch (error) {
    console.log('bad symbol')
  }
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

const editSocketData = (getData) => {
  const [time, open, close, high, low, volume, amount] = getData
  // Update data
  let lastSocketData = {
    time: parseInt(time) * 1000,
    open: parseFloat(open),
    high: parseFloat(high),
    low: parseFloat(low),
    close: parseFloat(close),
    volume: parseFloat(volume),
    openTime: parseInt(time),
  }
  return lastSocketData
}

const initSubscribe = ({ label }) => {
  return JSON.stringify({
    id: Date.now(),
    type: 'subscribe',
    topic: `/market/snapshot:${label}`,
    response: true,
  })
}
//using proxy
const fetchTickers = () => {
  return new Promise(async (resolve) => {
    const client = new XMLHttpRequest()
    client.open(
      'GET',
      'https://cors.bridged.cc/https://api.kucoin.com/api/v1/market/allTickers'
    )
    client.send()
    client.onload = () => {
      const { data } = JSON.parse(client.responseText)
      const { ticker } = data
      resolve(ticker)
    }
  })
}

const preparePing = () => {
  return {
    id: '1545910590801',
    type: 'ping',
  }
}

const socketSubscribe = ({ symbolInfo, interval }) => {
  const symbol = symbolInfo.name.replace('/', '-')
  let paramStr = `/market/candles:${symbol}_${interval}`

  const obj = {
    id: Date.now(),
    type: 'subscribe',
    topic: paramStr,
    response: true,
  }
  return { obj, paramStr }
}

const klineSocketUnsubscribe = ({ param }) => {
  const obj = {
    type: 'unsubscribe',
    topic: param,
    id: 1,
  }
  return obj
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
          `${localStorage.getItem(
            'proxyServer'
          )}https://api.kucoin.com/api/v1/bullet-public`
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
        `${localStorage.getItem(
          'proxyServer'
        )}https://api.kucoin.com/api/v1/bullet-public`
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

const getIncomingSocket = ({ sData }) => {
  return sData.data.candles
}

const fetchTicker = async ({ symbol }) => {
  return await ccxtClass[EXCHANGE].fetchTicker(symbol)
}

const KuCoin = {
  getKlines,
  editSymbol,
  editKline,
  onSocketMessage,
  initSubscribe,
  fetchTicker,
  getSocketEndpoint,
  fetchTickers,
  editSocketData,
  editMessage,
  klineSocketUnsubscribe,
  socketSubscribe,
  preparePing,
  getIncomingSocket,
}

export default KuCoin
