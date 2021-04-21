import ccxt from 'ccxt'
export default class ftxAPI {
  constructor() {
    this.ftxHost = 'https://ftx.com/api'
    this.ftx = new ccxt.ftx()
    this.ftx.proxy = window.location.hostname === "localhost" ? 'http://localhost:9999/' : '' // https://cors-anywhere.herokuapp.com/
  }

  getKlines(symbol, interval, startTime, endTime, limit) {
    try {
      return this.ftx.fetchOHLCV(symbol, interval, startTime, limit)
    }
    catch (e) {
      console.log(e)
    }
  }

  getSymbols() {
    try {
      return this.ftx.loadMarkets()
    }
    catch (e) {
      console.log(e)
    }
  }
}
