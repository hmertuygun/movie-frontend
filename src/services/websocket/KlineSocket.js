import { EXCHANGE_OPTIONS } from 'constants/ExchangesList'
import {
  editSocketData,
  getIncomingSocket,
  getSocketEndpoint,
  klineSocketUnsubscribe,
  preparePing,
  resolveGzip,
  socketSubscribe,
} from 'services/exchanges'
import { storage } from 'services/storages'
export default class klineSocket {
  constructor() {
    let currentExchange = localStorage.getItem('selectedExchange')
    this.exchange = currentExchange
    this.exchangeOptions = EXCHANGE_OPTIONS[currentExchange]
    this.exchangeName = this.exchangeOptions['label']
    this.intervals = this.exchangeOptions['mappedResolutionsSocket']
    this.streams = {}
    this._ws = null
    this.inittialSetup()
  }

  async inittialSetup() {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    this.socketUrl = await getSocketEndpoint(this.exchange)
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

      this._ws.onmessage = async (msg) => {
        if (!msg?.data) return
        let s = localStorage.getItem('selectedSymbol').replace('/', '')
        let sData = ''
        try {
          if (msg.data instanceof Blob) {
            sData = await resolveGzip(msg.data)
          } else {
            sData = JSON.parse(msg.data)
          }
          const getData = await getIncomingSocket(this.exchange, sData)
          if (sData && getData) {
            let lastSocketData = editSocketData(this.exchange, getData)
            if (Object.keys(this.streams).length) {
              storage.set('lastSocketData', new Date().getTime())
              storage.set('WS', 1)
              if (!isNaN(lastSocketData?.time))
                if (this.streams[s]) {
                  this.streams[s].data = lastSocketData
                  this.streams[s].listener(lastSocketData)
                }
            }
          }
        } catch (e) {
          console.log(e)
        }
      }

      const needPing = this.exchangeOptions['needPingAlive']
      if (needPing) {
        const pingPayload = preparePing(this.exchange)
        setInterval(() => {
          if (this._ws.readyState === 1)
            this._ws.send(JSON.stringify(pingPayload))
        }, 5000)
      }
    } catch (e) {
      console.log(e)
    }
  }

  async subscribeOnStream(symbolInfo, resolution, onRealtimeCallback) {
    try {
      if (!this._ws) return
      if (symbolInfo.name !== storage.get('selectedSymbol')) return
      if (this.exchange === 'kucoin') {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
      const symbol = symbolInfo.name.replace('/', '')
      const { obj, paramStr } = socketSubscribe(this.exchange, {
        symbol: symbolInfo.name,
        interval: this.intervals[resolution],
      })
      if (this._ws.readyState === 1) {
        this._ws.send(JSON.stringify(obj))
        this.streams = {}
        this.streams[symbol] = {
          paramStr,
          listener: onRealtimeCallback,
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  async unsubscribeFromStream(subscriberUID) {
    try {
      let id = subscriberUID.split('_')[0].replace('/', '')
      if (this.streams[id]?.paramStr) {
        const obj = await klineSocketUnsubscribe(
          this.exchange,
          this.streams[id].paramStr
        )
        this._ws.send(JSON.stringify(obj))
      }
    } catch (e) {
      console.log(e)
    }
  }
}
