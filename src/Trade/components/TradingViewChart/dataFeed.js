import binanceAPI from '../../../api/binanceAPI'
import ftxAPI from '../../../api/ftxAPI'
import binanceSockets from '../../../sockets/binanceSockets'
import ftxSockets from '../../../sockets/ftxSockets'
export default class dataFeed {
  constructor({ exchange, debug }) {
    this.binanceStr = "binance"
    this.ftxStr = "ftx"
    this.selectedExchange = exchange
    this.ftxResolutions = ['1', '5', '15', '60', '240', '1440']
    this.ftxMappedResolutions = { '1': 60, '5': 300, '15': 900, '60': 3600, '240': 14400, '1440': 86400 }
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
  }
  onReady(callback) {
    this.symbols = this.exchangeAPI.getSymbols()
    callback({
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: true,
      supported_resolutions: this.selectedExchange === this.binanceStr ? this.binanceResolutions : this.ftxResolutions
    })
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    let chosenSymbol = localStorage.getItem('selectedSymbol') || symbolName
    const comps = chosenSymbol.split(':')
    chosenSymbol = (comps.length > 1 ? comps[1] : chosenSymbol).toUpperCase()

    function pricescale(symbol) {
      for (let filter of symbol.filters) {
        if (filter.filterType === 'PRICE_FILTER') {
          return Math.round(1 / parseFloat(filter.tickSize))
        }
      }
      return 1
    }

    for (let symbol of this.symbols) {
      if (this.selectedExchange === this.binanceStr) {
        if (symbol.symbol === chosenSymbol) {
          setTimeout(() => {
            onSymbolResolvedCallback({
              name: symbol.symbol,
              description: symbol.baseAsset + ' / ' + symbol.quoteAsset,
              ticker: symbol.symbol,
              exchange: 'Binance',
              listed_exchange: 'Binance',
              type: 'crypto',
              session: '24x7',
              pricescale: pricescale(symbol),
              timezone: 'UTC',
              currency_code: symbol.quoteAsset,
              has_intraday: true,
              has_daily: true,
              has_weekly_and_monthly: true,
              minmov: 1,
            })
          }, 0)
          return
        }
      }
      else if (this.selectedExchange === this.ftxStr) {
        if (symbol.name === chosenSymbol) {
          setTimeout(() => {
            onSymbolResolvedCallback({
              name: symbol.name,
              description: symbol.type === "future" ? symbol.name.replace("-", " / ") : symbol.baseCurrencey + ' / ' + symbol.quoteCurrency,
              ticker: symbol.name,
              exchange: 'FTX',
              listed_exchange: 'FTX',
              type: 'crypto',
              session: '24x7',
              pricescale: symbol.priceIncrement,
              timezone: 'UTC',
              currency_code: symbol.type === "future" ? symbol.underlying : symbol.quoteCurrency,
              has_intraday: true,
              has_daily: true,
              has_weekly_and_monthly: true,
              minmov: 1,
            })
          }, 0)
          return
        }
      }
    }

    onResolveErrorCallback('not found')
  }

  getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
    const interval = this.selectedExchange === this.binanceStr ? this.binanceMappedResolutions[resolution] : this.ftxMappedResolutions[resolution]

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
            time: new Date(kline.startTime).getTime() / 1000,
            close: kline.close,
            open: kline.open,
            high: kline.high,
            low: kline.low,
            volume: kline.volume
          }))
        }
        onHistoryCallback(historyCBArray, { noData: false })
      }
    }

    const getKlines = (from, to) => {
      this.exchangeAPI.getKlines(symbolInfo.name, interval, from, to, 500).then(klines => {
        totalKlines = this.selectedExchange === this.binanceStr ? totalKlines.concat(klines) : totalKlines.concat(klines.result)
        if (klines.length === 500) {
          from = klines[klines.length - 1][0] + 1
          getKlines(from, to)
        } else {
          finishKlines()
        }
      }).catch(err => {
        console.error(err)
        onErrorCallback('Some problem')
      })
    }

    if (this.selectedExchange === this.binanceStr) {
      from *= 1000
      to *= 1000
    }

    getKlines(from, to)
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
    this.ws.subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback)
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
