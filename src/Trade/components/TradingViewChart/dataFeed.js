import binanceAPI from '../../../api/binanceAPI'
import ftxAPI from '../../../api/ftxAPI'
import binanceSockets from '../../../sockets/binanceSockets'
import ftxSockets from '../../../sockets/ftxSockets'
export default class dataFeed {
  constructor({ exchange, debug }) {
    this.selectedExchang = exchange
    this.exchangeAPI = exchange === "binance" ? new binanceAPI() : exchange === "ftx" ? new ftxAPI() : ''
    this.ws = exchange === "binance" ? new binanceSockets() : exchange === "ftx" ? new ftxSockets() : ''
  }
  onReady(callback) {
    this.exchangeAPI.getSymbols().then((symbols) => {
      this.symbols = symbols
      callback({
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
        supported_resolutions: [
          '1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '1W', '1M'
        ]
      })
    }).catch(err => {
      console.error(err)
    })
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

    onResolveErrorCallback('not found')
  }

  getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {

    const interval = {
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
    }[resolution]

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
        onHistoryCallback(totalKlines.map(kline => {
          return {
            time: kline[0],
            close: parseFloat(kline[4]),
            open: parseFloat(kline[1]),
            high: parseFloat(kline[2]),
            low: parseFloat(kline[3]),
            volume: parseFloat(kline[5])
          }
        }), {
          noData: false
        })
      }
    }

    const getKlines = (from, to) => {
      this.exchangeAPI.getKlines(symbolInfo.name, interval, from, to, 500).then(klines => {
        totalKlines = totalKlines.concat(klines)

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

    from *= 1000
    to *= 1000

    getKlines(from, to)
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
    this.ws.subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback)
  }

  unsubscribeBars(subscriberUID) {
    this.ws.unsubscribeFromStream(subscriberUID)
  }
}
