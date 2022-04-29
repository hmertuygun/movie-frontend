import { whitelistedUrl } from 'constants/ccxtConfigs'
import { storage } from 'services/storages'

const socketSubscribe = (symbol, interval) => {
  const activeSymbol = symbol.replace('/', '-')
  const paramStr = `/market/candles:${activeSymbol}_${interval}`
  const obj = {
    id: Date.now(),
    type: 'subscribe',
    topic: paramStr,
    response: true,
  }
  return { obj, paramStr }
}

const klineSocketUnsubscribe = (param) => {
  return {
    type: 'unsubscribe',
    topic: param,
    id: 1,
  }
}

const editSocketData = (params) => {
  const [time, open, close, high, low, volume] = params
  return {
    time: parseInt(time) * 1000,
    open: parseFloat(open),
    high: parseFloat(high),
    low: parseFloat(low),
    close: parseFloat(close),
    volume: parseFloat(volume),
    openTime: parseInt(time),
  }
}

const getIncomingSocket = (sData) =>
  sData.data?.candles ? sData.data.candles : null

const getSocketEndpoint = async () => {
  return new Promise(async (resolve) => {
    const token = storage.get('kucoinEndpoint')
    if (token) {
      let { endpoint, date } = token
      var diffMins = (new Date() - new Date(date)) / 1000 / 60
      if (endpoint && diffMins < 600) {
        resolve(
          `wss://ws-api.kucoin.com/endpoint?token=${endpoint}&[connectId=${Date.now()}]`
        )
      } else {
        const client = new XMLHttpRequest()
        client.open(
          'POST',
          `${whitelistedUrl}https://api.kucoin.com/api/v1/bullet-public`
        )
        client.send()

        client.onload = () => {
          const { data } = JSON.parse(client.responseText)
          if (data?.token) {
            let newToken = data.token
            storage.set('kucoinEndpoint', {
              endpoint: newToken,
              date: new Date().getTime(),
            })
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
        `${whitelistedUrl}https://api.kucoin.com/api/v1/bullet-public`
      )
      client.send()

      client.onload = () => {
        const { data } = JSON.parse(client.responseText)
        if (data?.token) {
          let newToken = data.token
          storage.set('kucoinEndpoint', {
            endpoint: newToken,
            date: new Date().getTime(),
          })
          resolve(
            `wss://ws-api.kucoin.com/endpoint?token=${newToken}&[connectId=${Date.now()}]`
          )
        }
      }
    }
  })
}

const Kucoin = {
  socketSubscribe,
  klineSocketUnsubscribe,
  editSocketData,
  getSocketEndpoint,
  getIncomingSocket,
}

export default Kucoin
