export default class binanceAPI {
  constructor() {
    this.binanceHost = 'https://api1.binance.com'
  }

  getServerTime() {
    return fetch(this.binanceHost + '/api/v1/time').then(res => {
      return res.json()
    }).then(json => {
      return json.serverTime
    })
  }

  getSymbols() {
    return fetch(this.binanceHost + '/api/v1/exchangeInfo').then(res => {
      return res.json()
    }).then(json => {
      return json.symbols
    })
  }

  getKlines(symbol, interval, startTime, endTime, limit) {
    const url = `${this.binanceHost}/api/v1/klines?symbol=${symbol}&interval=${interval}${startTime ? `&startTime=${startTime}` : ''}${endTime ? `&endTime=${endTime}` : ''}${limit ? `&limit=${limit}` : ''}`

    return fetch(url).then(res => {
      return res.json()
    }).then(json => {
      return json
    })
  }
}
