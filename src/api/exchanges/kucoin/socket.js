import tvIntervals from '../../../helpers/tvIntervals'
import {
  getExchangeProp,
  execExchangeFunc,
} from '../../../helpers/getExchangeProp'
import ReconnectingWebSocket from 'reconnecting-websocket'
export default class socketClient {
  constructor() {
    let currentExchange = localStorage.getItem('selectedExchange')
    this.socketToken = getExchangeProp(currentExchange, 'socketTokenUrl')
    this.exchangeName = getExchangeProp(currentExchange, 'label')
    this.socketUrl = ''
    this.streams = {}
    this.ping = 0
    this._createSocket()
  }

  openWS() {
    this._ws = null
    this._ws = ReconnectingWebSocket(this.socketUrl)
  }

  _createSocket() {
    try {
      execExchangeFunc('kucoin', 'socketUrl').then((url) => {
        this.socketUrl = url
        this._ws = null
        this._ws = new WebSocket(this.socketUrl)
        this._ws.onopen = (e) => {
          console.info(`${this.exchangeName} WS Open`)
          localStorage.setItem('WS', 1)
        }

        this._ws.onclose = (e) => {
          this.isDisconnected = true
          localStorage.setItem('WS', 0)
          console.warn(`${this.exchangeName}  WS Closed`, e)
        }

        this._ws.onerror = (err) => {
          this.isDisconnected = true
          localStorage.setItem('WS', 0)
          console.warn(`${this.exchangeName}  Error`, err)
        }

        this._ws.onmessage = (msg) => {
          if (!msg?.data) return
          let sData = JSON.parse(msg.data)
          try {
            if (sData.data) {
              let { data } = sData
              let { symbol, candles } = data
              if (candles) {
                const [time, open, close, high, low, volume, amount] = candles
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
                this.ping = this.ping + 1
                if (this.ping % 10 === 0) {
                  this._ws.send(
                    JSON.stringify({
                      id: Date.now(),
                      type: 'subscribe',
                      topic: 'ping',
                      response: true,
                    })
                  )
                }

                if (Object.keys(this.streams).length) {
                  localStorage.setItem('lastSocketData', new Date().getTime())
                  localStorage.setItem('WS', 1)

                  this.streams[symbol].data = lastSocketData
                  this.streams[symbol].listener(lastSocketData)
                }
              }
            }
          } catch (e) {
            console.log(e)
          }
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  checkIfSocketOpen() {}

  subscribeOnStream(
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscribeUID,
    onResetCacheNeededCallback,
    lastDailyBar
  ) {
    try {
      const resolutions = getExchangeProp('kucoin', 'mappedResolutionsSocket')
      const symbol = symbolInfo.name.replace('/', '-')
      let paramStr = `/market/candles:${symbol}_${resolutions[resolution]}`

      const obj = {
        id: Date.now(),
        type: 'subscribe',
        topic: paramStr,
        response: true,
      }
      if (this._ws.readyState === 1) {
        this._ws.send(JSON.stringify(obj))
        this.streams[symbol] = {
          // register multiple streams in streams object
          paramStr,
          listener: onRealtimeCallback,
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  unsubscribeFromStream(subscriberUID) {
    try {
      let id = subscriberUID.split('_')[0].replace('/', '-')

      if (!this.streams[id] || !this.streams[id].paramStr) return
      const symbol = this.streams[id].paramStr.substring(
        this.streams[id].paramStr.indexOf(':') + 1,
        this.streams[id].paramStr.lastIndexOf('_')
      )
      const obj = {
        type: 'unsubscribe',
        topic: `/market/candle:${symbol}`,
        privateChannel: false,
      }
      delete this.streams[id]
      if (this._ws.readyState === 1) {
        this._ws.send(JSON.stringify(obj))
      }
    } catch (e) {
      console.log(e)
    }
  }
}
