import { getExchangeProp } from '../../../helpers/getExchangeProp'

export default class socketClient {
  constructor() {
    let currentExchange = localStorage.getItem('selectedExchange')
    this.socketUrl = getExchangeProp(currentExchange, 'socketUrl')
    this.exchangeName = getExchangeProp(currentExchange, 'label')
    this.intervals = getExchangeProp(currentExchange, 'mappedResolutionsSocket')
    this.streams = {}
    this.symbol = ''
    this._createSocket()
  }

  openWS() {
    this._ws = null
    this._ws = new WebSocket(this.socketUrl)
  }

  _createSocket() {
    try {
      this._ws = null
      this._ws = new WebSocket(this.socketUrl)
      this._ws.onopen = (e) => {
        console.info(`${this.exchangeName} WS Open`)
        localStorage.setItem('WS', 1)
      }

      this._ws.onclose = () => {
        this.isDisconnected = true
        localStorage.setItem('WS', 0)
        console.warn(`${this.exchangeName}  WS Closed`)
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
          if (sData && sData?.data && sData?.data[0]) {
            let { open, high, low, volume, close, timestamp, start, end } =
              sData.data[0]
            // Update data
            let lastSocketData = {
              time: start * 1000,
              close,
              open,
              high,
              low,
              volume: parseFloat(volume),
              closeTime: end * 1000,
              openTime: start * 1000,
            }
            if (
              Object.keys(this.streams).length &&
              localStorage.getItem('selectedSymbol').replace('/', '') ==
                sData.topic.split('.')[2]
            ) {
              localStorage.setItem('lastSocketData', new Date().getTime())
              localStorage.setItem('WS', 1)
              this.streams[
                localStorage.getItem('selectedSymbol').replace('/', '')
              ].data = lastSocketData
              this.streams[
                localStorage.getItem('selectedSymbol').replace('/', '')
              ].listener(lastSocketData)
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
      this.symbol = symbolInfo.name.replace('/', '')
      const symbol = symbolInfo.name.replace('/', '')
      let paramStr = `candle.${this.intervals[resolution]}.${symbol}`
      const obj = {
        op: 'subscribe',
        args: [paramStr],
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
      console.log(this.streams[id].paramStr)
      if (this.streams[id]?.paramStr)
        this._ws.send(
          `{"op":"unsubscribe","args":[${this.streams[id].paramStr}]}`
        )
    } catch (e) {
      console.log(e)
    }
  }
}
