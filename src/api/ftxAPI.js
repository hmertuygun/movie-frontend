
export default class ftxAPI {
  constructor() {
    this.ftxHost = 'https://ftx.com/api'
  }

  getKlines(symbol, interval, startTime, endTime, limit) {
    const url = `${this.ftxHost}/markets/${symbol}/candles?resolution=${interval}${startTime ? `&start_time=${startTime}` : ''}${endTime ? `&end_time=${endTime}` : ''}${limit ? `&limit=${limit}` : ''}`

    return fetch(url).then(res => {
      return res.json()
    }).then(json => {
      return json
    })
  }

  getSymbols() {
    return fetch(`${this.ftxHost}/markets`).then(res => {
      return res.json()
    }).then(json => {
      return json.result
    })
  }
}
