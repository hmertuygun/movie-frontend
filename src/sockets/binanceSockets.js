import tvIntervals from '../helpers/tvIntervals'
export default class socketClient {
  constructor({ exchange }) {
    this.binanceWS =
      exchange === 'binance'
        ? 'wss://stream.binance.com:9443/ws'
        : 'wss://stream.binance.us:9443/ws'
    this.streams = {} // e.g: {'BTCUSDT': { paramStr: '', data:{}, listener:  } }
    this._createSocket()
  }

  openWS() {
    this._ws = null
    this._ws = new WebSocket(this.binanceWS)
  }

  _createSocket() {
    try {
      this._ws = null
      this._ws = new WebSocket(this.binanceWS)
      this._ws.onopen = (e) => {
        console.info(`Binance WS Open`)
        localStorage.setItem('WS', 1)
      }

      this._ws.onclose = () => {
        this.isDisconnected = true
        localStorage.setItem('WS', 0)
        console.warn('Binance WS Closed')
      }

      this._ws.onerror = (err) => {
        this.isDisconnected = true
        localStorage.setItem('WS', 0)
        console.warn('WS Error', err)
      }

      this._ws.onmessage = (msg) => {
        if (!msg?.data) return
        let sData = JSON.parse(msg.data)
        try {
          if (sData && sData.k) {
            let { s } = sData
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
              localStorage.setItem('lastSocketData', new Date().getTime())
              localStorage.setItem('WS', 1)
              this.streams[s].data = lastSocketData
              this.streams[s].listener(lastSocketData)
            }
          }
        } catch (e) {
          console.log(e)
        }
      }
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
      const symbol = symbolInfo.name.replace('/', '')
      let paramStr = `${symbol.toLowerCase()}@kline_${tvIntervals[resolution]}`
      const obj = {
        method: 'SUBSCRIBE',
        params: [paramStr],
        id: 1,
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
      let id = subscriberUID.split('_')[0].replace('/', '')
      if (!this.streams[id] || !this.streams[id].paramStr) return
      const obj = {
        method: 'UNSUBSCRIBE',
        params: [this.streams[id]?.paramStr],
        id: 1,
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
