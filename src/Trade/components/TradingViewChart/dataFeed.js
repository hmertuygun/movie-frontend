import binanceAPI from '../../../api/binanceAPI'
import ftxAPI from '../../../api/ftxAPI'
import binanceSockets from '../../../sockets/binanceSockets'
import ftxSockets from '../../../sockets/ftxSockets'
export default class dataFeed {
  constructor({ exchange, symbolList, selectedSymbolDetail, marketSymbols, debug }) {
    this.binanceStr = "binance"
    this.ftxStr = "ftx"
    this.selectedExchange = exchange
    this.symbolList = symbolList
    this.ftxResolutions = ['1', '5', '15', '60', '240', '1440']
    this.ftxMappedResolutions = { '1': '1m', '5': '5m', '15m': 900, '1h': 3600, '4h': 14400, '1d': 86400 }
    this.binanceResolutions = ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '1W', '1M']
    this.binanceMappedResolutions = {
      '1': '1m',
      '3': '3m',
      '5': '5m',
      '15': '15m',
      '30': '30m',
      '60': '1h',
      '120': '2h',
      '240': '4h',
      '360': '6h',
      '480': '8h',
      '720': '12h',
      'D': '1d',
      '1D': '1d',
      '3D': '3d',
      'W': '1w',
      '1W': '1w',
      'M': '1M',
      '1M': '1M',
    }
    this.exchangeAPI = exchange === this.binanceStr ? new binanceAPI() : exchange === this.ftxStr ? new ftxAPI() : ''
    this.ws = new binanceSockets()
    this.selectedSymbolDetail = selectedSymbolDetail
    this.marketSymbols = marketSymbols
    this.fromDate = null
    this.toDate = null
  }
  async onReady(callback) {
    // this.symbols = await this.exchangeAPI.getSymbols()
    //console.log(this.symbolList)
    callback({
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: true,
      supported_resolutions: this.selectedExchange === this.binanceStr ? this.binanceResolutions : this.ftxResolutions
    })
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    let chosenSymbol = localStorage.getItem('selectedSymbol') || symbolName
    // console.log(chosenSymbol)
    const selectedSymbolDetail = `${this.selectedExchange === this.binanceStr ? 'BINANCE' : 'FTX'}:${chosenSymbol}`
    // console.log(this.marketSymbols[selectedSymbolDetail])
    onSymbolResolvedCallback({
      name: chosenSymbol,
      description: chosenSymbol,
      ticker: chosenSymbol,
      exchange: this.selectedExchange === this.binanceStr ? 'BINANCE' : 'FTX',
      listed_exchange: this.selectedExchange === this.binanceStr ? 'BINANCE' : 'FTX',
      type: 'Crypto',
      session: '24x7',
      pricescale: 1, // parseInt(this.selectedSymbolDetail.tickSize)
      timezone: 'UTC',
      currency_code: selectedSymbolDetail.quote_asset,
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: true,
      minmov: 1,
    })
  }

  getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
    //console.log(from, to)
    const interval = this.selectedExchange === this.binanceStr ? this.binanceMappedResolutions[resolution] : this.binanceMappedResolutions[resolution]

    if (!interval) {
      onErrorCallback('Invalid interval')
    }

    let totalKlines = []

    const finishKlines = () => {
      if (this.debug) {
        console.log('📊:', totalKlines.length)
      }

      if (totalKlines.length === 0) {
        onHistoryCallback([], { noData: true })
      } else {
        let historyCBArray
        if (this.selectedExchange === this.binanceStr) {
          historyCBArray = totalKlines.map(kline => ({
            time: kline[0],
            close: parseFloat(kline[4]),
            open: parseFloat(kline[1]),
            high: parseFloat(kline[2]),
            low: parseFloat(kline[3]),
            volume: parseFloat(kline[5])
          }))
        }
        else {
          historyCBArray = totalKlines.map(kline => ({
            time: kline[0],
            open: kline[1],
            high: kline[2],
            low: kline[3],
            close: kline[4],
            volume: kline[5]
          }))
        }
        onHistoryCallback(historyCBArray, { noData: false })
      }
    }

    const getKlines = async (from, to) => {
      // symbolInfo.name, interval, from, to, 500
      // 'BTC/USD', '1m', 1618740996000, null, 500
      const symbolName = this.selectedExchange === this.binanceStr ? symbolInfo.name : symbolInfo.name.replace('-', '/')
      const data = await this.exchangeAPI.getKlines(symbolInfo.name, this.binanceMappedResolutions[resolution], from, null, 500)
      this.fromDate = from
      totalKlines = totalKlines.concat(data)
      if (data.length === 500) {
        from = data[data.length - 1][0] + 1
        this.fromDate = from
        getKlines(from, to)
      } else {
        finishKlines()
      }

      // this.exchangeAPI.getKlines(symbolInfo.name, interval, from, to, 500).then(klines => {
      //   totalKlines = this.selectedExchange === this.binanceStr ? totalKlines.concat(klines) : totalKlines.concat(klines.result)
      //   if (klines.length === 500) {
      //     from = klines[klines.length - 1][0] + 1
      //     getKlines(from, to)
      //   } else {
      //     finishKlines()
      //   }
      // }).catch(err => {
      //   console.error(err)
      //   onErrorCallback('Some problem')
      // })
    }

    from *= 1000
    to *= 1000

    getKlines(from, to)
  }

  async subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
    if (this.selectedExchange === this.binanceStr) {
      this.ws.subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback)
    }
    else {
      // let time = parseInt(new Date().getTime() / 1000)
      // const kline = await this.exchangeAPI.getKlines(symbolInfo.name.replace('-', '/'), 15, null, null, 500)
      // console.log(kline)
      // const cbData = {
      //   time: kline[0],
      //   open: kline[1],
      //   high: kline[2],
      //   low: kline[3],
      //   close: kline[4],
      //   volume: kline[5]
      // }
      // onRealtimeCallback(cbData)
    }
  }

  unsubscribeBars(subscriberUID) {
    this.ws.unsubscribeFromStream(subscriberUID)
  }

  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    userInput = userInput.toUpperCase()
    onResultReadyCallback(
      this.symbols.filter((symbol) => {
        return symbol.symbol.indexOf(userInput) >= 0
      }).map((symbol) => {
        return {
          symbol: symbol.symbol,
          full_name: symbol.symbol,
          description: symbol.baseAsset + ' / ' + symbol.quoteAsset,
          ticker: symbol.symbol,
          exchange: 'Binance',
          type: 'crypto'
        }
      })
    )
  }
}
