import ReconnectingWebSocket from 'reconnecting-websocket'
export default class socketClient {
  constructor() {
    this.baseUrl = 'wss://stream.binance.com:9443/ws'
    this.tvIntervals = {
      '1': '1m',
      '3': '3m',
      '5': '5m',
      '15': '15m',
      '30': '30m',
      '60': '1h',
      '120': '2h',
      '240': '4h',
      '360': '6h',
      '480': '8h',
      '720': '12h',
      'D': '1d',
      '1D': '1d',
      '3D': '3d',
      'W': '1w',
      '1W': '1w',
      'M': '1M',
      '1M': '1M',
    }
    this.paramStr = ''
    this.lastSocketData = {}
    this.streams = {} // e.g: {'BTCUSDT': { paramStr: '', data:{}, listener:  } }
    this.isDisconnected = false
    this._createSocket()
  }

  reconnectWSOnWindowFocus() {
    document.addEventListener('visibilitychange', (ev) => {
      console.log(`Tab state : ${document.visibilityState}`)
      console.log(this._ws)
      if (this._ws && 'onmessage' in this._ws && this.isDisconnected && document.visibilityState === "visible") {
        console.log(this._ws)
        this.isDisconnected = false
        this._ws.close()
        this._createSocket()
      }
    })
  }

  _createSocket() {
    try {
      this._ws = new WebSocket('wss://stream.binance.com:9443/ws')
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
        try {
          if (sData && sData.k) {
            let { s, E } = sData
            let { o, h, l, v, c, T, t } = sData.k
            // Update data
            let lastSocketData = {
              time: t,
              close: parseFloat(c),
              open: parseFloat(o),
              high: parseFloat(h),
              low: parseFloat(l),
              volume: parseFloat(v),
              closeTime: T,
              openTime: t,
            }
            if (Object.keys(this.streams).length) {
              this.streams[s].data = lastSocketData
              this.streams[s].listener(lastSocketData)
            }
          }
        }
        catch (e) {
          console.log(e)
        }
      }

      this.reconnectWSOnWindowFocus()
    }
    catch (e) {
      console.log(e)
    }
  }

  subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback, lastDailyBar) {
    try {
      let paramStr = `${symbolInfo.name.toLowerCase()}@kline_${this.tvIntervals[resolution]}`
      const obj = {
        method: "SUBSCRIBE",
        params: [
          paramStr
        ],
        id: 1
      }
      if (this._ws.readyState === 1) {
        this._ws.send(JSON.stringify(obj))
        //register multiple streams in streams object
        this.streams[symbolInfo.name] = {
          paramStr,
          listener: onRealtimeCallback
        }
      }
    }
    catch (e) {
      console.log(e)
    }
  }

  unsubscribeFromStream(subscriberUID) {
    try {
      let id = subscriberUID.split("_")[0]
      if (!this.streams[id] || !this.streams[id].paramStr) return
      const obj = {
        method: "UNSUBSCRIBE",
        params: [
          this.streams[id]?.paramStr
        ],
        id: 1
      }
      delete this.streams[id]
      if (this._ws.readyState === 1) {
        this._ws.send(JSON.stringify(obj))
      }
    }
    catch (e) {
      console.log(e)
    }
  }
}
