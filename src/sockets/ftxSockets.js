import ReconnectingWebSocket from 'reconnecting-websocket'
export default class socketClient {
  constructor() {
    this.ftxWS = ' wss://ftx.com/ws'
    this.streams = {} // e.g: {'BTCUSDT': { paramStr: '', data:{}, listener:  } }
    this._createSocket()
  }
  _createSocket() {
    try {
      this._ws = null
      this._ws = new WebSocket(this.ftxWS)

      this._ws.onopen = (e) => {
        console.info(`Binance WS Open`)
      }

      this._ws.onclose = () => {
        this.isDisconnected = true
        console.warn('Binance WS Closed')
      }

      this._ws.onerror = (err) => {
        this.isDisconnected = true
        console.warn('WS Error', err)
      }

      this._ws.onmessage = (msg) => {
        if (!msg?.data) return
        let sData = JSON.parse(msg.data)
        console.log(sData)
        try {
          if (sData && sData?.data && sData?.market) {
            const { ask, bid, last, time } = sData.data
            let lastSocketData = {
              time: parseInt(time * 1000),
              close: bid,
              open: last,
            }
            this.streams[sData.market].data = lastSocketData
            this.streams[sData.market].listener(lastSocketData)
          }
        } catch (e) {
          console.log(e)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  subscribeOnStream(
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscribeUID,
    onResetCacheNeededCallback,
    lastDailyBar
  ) {
    console.log(symbolInfo)
    try {
      let paramStr = {
        op: 'subscribe',
        channel: 'ticker',
        market: symbolInfo.name,
      }
      if (this._ws.readyState === 1) {
        console.log(`Send`)
        this._ws.send(JSON.stringify(paramStr))
        this.streams[symbolInfo.name] = {
          paramStr,
          listener: onRealtimeCallback,
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  unsubscribeFromStream(subscriberUID) {
    console.log(subscriberUID)
    try {
      let id = subscriberUID.split('_')[0]
      if (!this.streams[id]) return
      let paramStr = { op: 'unsubscribe', channel: 'ticker', market: id }
      if (this._ws.readyState === 1) {
        this._ws.send(JSON.stringify(paramStr))
        delete this.streams[id]
      }
    } catch (e) {
      console.log(e)
    }
  }
}
