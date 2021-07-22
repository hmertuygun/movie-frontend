import binanceAPI from '../../../api/binanceAPI'
import binanceSockets from '../../../sockets/binanceSockets'
import tvIntervals from '../../../helpers/tvIntervals'
export default class dataFeed {
  constructor({
    exchange,
    symbolList,
    selectedSymbolDetail,
    marketSymbols,
    debug,
  }) {
    this.selectedExchange = exchange
    this.symbolList = symbolList
    this.binanceResolutions = [
      '1',
      '3',
      '5',
      '15',
      '30',
      '60',
      '120',
      '240',
      '360',
      '480',
      '720',
      '1D',
      '1W',
      '1M',
    ]
    this.debug = debug
    this.binanceAPI = new binanceAPI()
    this.ws = new binanceSockets()
    this.selectedSymbolDetail = selectedSymbolDetail
    this.marketSymbols = marketSymbols
  }
  onReady(callback) {
    //console.log(`onReady`)
    callback({
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: true,
      supported_resolutions:
        this.selectedExchange === this.binanceStr
          ? this.binanceResolutions
          : this.ftxResolutions,
    })
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    let chosenSymbol = localStorage.getItem('selectedSymbol') || symbolName
    onSymbolResolvedCallback({
      name: chosenSymbol,
      description: chosenSymbol,
      ticker: chosenSymbol,
      exchange: 'BINANCE',
      listed_exchange: 'BINANCE',
      type: 'crypto',
      session: '24x7',
      pricescale: 100, // parseInt(this.selectedSymbolDetail.tickSize)
      timezone: 'UTC',
      currency_code: chosenSymbol.replace('/', ''),
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: true,
      minmov: 1,
    })
  }

  getBars(
    symbolInfo,
    resolution,
    from,
    to,
    onHistoryCallback,
    onErrorCallback,
    firstDataRequest
  ) {
    //console.log(`getBars`)
    const interval = tvIntervals[resolution]
    if (!interval) {
      onErrorCallback('Invalid interval')
    }

    let totalKlines = []
    const kLinesLimit = 500
    const finishKlines = () => {
      if (this.debug) {
        console.log('📊:', totalKlines.length)
      }

      if (totalKlines.length === 0) {
        onHistoryCallback([], { noData: true })
      } else {
        let historyCBArray = totalKlines.map((kline) => ({
          time: kline[0],
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4]),
          volume: parseFloat(kline[5]),
        }))
        onHistoryCallback(historyCBArray, { noData: false })
      }
    }

    const getKlines = async (from, to) => {
      try {
        const symbolAPI = symbolInfo.name.replace('/', '')
        const data = await this.binanceAPI.getKlines(
          symbolAPI,
          tvIntervals[resolution],
          from,
          to,
          kLinesLimit
        )
        totalKlines = totalKlines.concat(data)
        if (data.length === kLinesLimit) {
          from = data[data.length - 1][0] + 1
          getKlines(from, to)
        } else {
          finishKlines()
        }
      } catch (e) {
        console.log(e)
        onErrorCallback(`Error in 'getKlines' func`)
      }
    }

    from *= 1000
    to *= 1000

    getKlines(from, to)
  }

  subscribeBars(
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback
  ) {
    this.ws.subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback
    )
  }

  unsubscribeBars(subscriberUID) {
    this.ws.unsubscribeFromStream(subscriberUID)
  }
}
