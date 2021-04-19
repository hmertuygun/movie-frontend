import axios from 'axios'
import ccxt from 'ccxt'
export default class ftxAPI {
  constructor() {
    this.ftxHost = 'https://ftx.com/api'
    this.ftx = new ccxt.ftx()
    this.ftx.proxy = 'https://cors-anywhere.herokuapp.com/' // https://cors-anywhere.herokuapp.com/
  }

  async getKlines(symbol, interval, startTime, endTime, limit) {
    //console.log(symbol, interval, startTime)
    try {
      return this.ftx.fetchOHLCV(symbol, interval, startTime, limit)
    }
    catch (e) {
      console.log(e)
    }
  }

  async getSymbols() {
    try {
      return await this.ftx.loadMarkets()
    }
    catch (e) {
      console.log(e)
    }
  }
}
