import { execExchangeFunc, getExchangeProp } from '../helpers/getExchangeProp'

export default class socketClient {
  constructor() {
    let currentExchange = localStorage.getItem('selectedExchange')
    this.exchange = currentExchange
    this.socketUrl = getExchangeProp(currentExchange, 'socketUrl')
    this.exchangeName = getExchangeProp(currentExchange, 'label')
    this.intervals = getExchangeProp(currentExchange, 'mappedResolutionsSocket')
    this.streams = {}
    this._createSocket()
  }

  openWS() {
    this._ws = null
    this._ws = new WebSocket(this.socketUrl)
  }

  _createSocket() {
    try {
      execExchangeFunc(this.exchange, 'socketUrl').then((url) => {
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

        this._ws.onmessage = async (msg) => {
          if (!msg?.data) return
          let s = localStorage.getItem('selectedSymbol').replace('/', '')
          let sData = ''
          if (msg.data instanceof Blob) {
            sData = await execExchangeFunc(
              this.exchange,
              'resolveGzip',
              msg.data
            )
          } else {
            sData = JSON.parse(msg.data)
          }
          try {
            const getData = execExchangeFunc(
              this.exchange,
              'getIncomingSocket',
              {
                sData,
              }
            )

            if (sData && getData) {
              let lastSocketData = execExchangeFunc(
                this.exchange,
                'editSocketData',
                getData
              )
              if (Object.keys(this.streams).length) {
                localStorage.setItem('lastSocketData', new Date().getTime())
                localStorage.setItem('WS', 1)
                if (this.streams[s]) {
                  this.streams[s].data = lastSocketData
                  this.streams[s].listener(lastSocketData)
                }
              }
            }
          } catch (e) {
            //console.log(e)
          }
        }

        const needPing = getExchangeProp(this.exchange, 'needPingAlive')
        if (needPing) {
          const pingPayload = execExchangeFunc(this.exchange, 'preparePing')
          setInterval(() => {
            this._ws.send(JSON.stringify(pingPayload))
          }, 10000)
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
      this.symbol = symbolInfo.name.replace('/', '')
      const symbol = symbolInfo.name.replace('/', '')
      const { obj, paramStr } = execExchangeFunc(
        this.exchange,
        'socketSubscribe',
        {
          symbolInfo,
          interval: this.intervals[resolution],
        }
      )

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
      if (this.streams[id]?.paramStr) {
        const obj = execExchangeFunc(this.exchange, 'klineSocketUnsubscribe', {
          param: this.streams[id].paramStr,
        })
        this._ws.send(JSON.stringify(obj))
      }
    } catch (e) {
      console.log(e)
    }
  }
}
