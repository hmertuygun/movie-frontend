export default class binanceAPI {
  constructor({ exchange }) {
    this.binanceHost =
      exchange === 'binance'
        ? 'https://api2.binance.com'
        : 'https://api.binance.us'
  }

  getServerTime() {
    return fetch(this.binanceHost + '/api/v1/time')
      .then((res) => {
        return res.json()
      })
      .then((json) => {
        return json.serverTime
      })
  }

  getSymbols() {
    return fetch(this.binanceHost + '/api/v1/exchangeInfo')
      .then((res) => {
        return res.json()
      })
      .then((json) => {
        return json.symbols
      })
  }

  getKlines(symbol, interval, startTime, endTime, limit) {
    const url = `${
      this.binanceHost
    }/api/v1/klines?symbol=${symbol}&interval=${interval}${
      startTime ? `&startTime=${startTime}` : ''
    }${endTime ? `&endTime=${endTime}` : ''}${limit ? `&limit=${limit}` : ''}`

    return fetch(url)
      .then((res) => {
        return res.json()
      })
      .then((json) => {
        return json
      })
  }
}
