import binanceAPI from '../../../api/binanceAPI'
import ftxAPI from '../../../api/ftxAPI'
import binanceSockets from '../../../sockets/binanceSockets'
import { EXCHANGE_SYMBOL } from '../../../constants/ExchangesList'
export default class dataFeed {
  constructor({ exchange, symbolList, marketSymbols, debug }) {
    this.binanceStr = 'binance'
    this.ftxStr = 'ftx'
    this.binanceUSStr = 'binanceus'
    this.selectedExchange = exchange
    this.symbolList = symbolList
    this.ftxResolutions = ['1', '5', '15', '60', '240', '1D']
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
    this.mappedResolutions = {
      1: '1m',
      3: '3m',
      5: '5m',
      15: '15m',
      30: '30m',
      60: '1h',
      120: '2h',
      240: '4h',
      360: '6h',
      480: '8h',
      720: '12h',
      D: '1d',
      '1D': '1d',
      '3D': '3d',
      W: '1w',
      '1W': '1w',
      M: '1M',
      '1M': '1M',
    }
    this.debug = debug
    this.binanceAPI = new binanceAPI({ exchange })
    this.ftxAPI = new ftxAPI()
    this.ws = new binanceSockets({ exchange })
    this.marketSymbols = marketSymbols
    this.pollingInterval = null
  }
  onReady(callback) {
    //console.log(`onReady`)
    // this.marketSymbols = JSON.parse(this.marketSymbols)
    setTimeout(() => {
      callback({
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
        supported_resolutions:
          this.selectedExchange === this.binanceStr ||
          this.selectedExchange === this.binanceUSStr
            ? this.binanceResolutions
            : this.ftxResolutions,
      })
    }, 0)
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    try {
      let chosenSymbol = symbolName // localStorage.getItem('selectedSymbol') ||
      this.selectedExchange = localStorage.getItem('selectedExchange')
      const selectedSymbol = `${
        EXCHANGE_SYMBOL[this.selectedExchange]
      }:${chosenSymbol}`
      const selectedSymbolDetail = this.marketSymbols[selectedSymbol]
      // console.log(selectedSymbolDetail)
      setTimeout(() => {
        onSymbolResolvedCallback({
          name: chosenSymbol,
          description: chosenSymbol,
          ticker: chosenSymbol,
          exchange: EXCHANGE_SYMBOL[this.selectedExchange],
          listed_exchange: EXCHANGE_SYMBOL[this.selectedExchange],
          type: 'crypto',
          session: '24x7',
          minmov: 1,
          pricescale: Math.pow(10, selectedSymbolDetail?.tickSize || 2),
          timezone: 'UTC',
          currency_code: chosenSymbol.split('/')[1],
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
        })
      }, 0)
    } catch (e) {
      console.log(e)
    }
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
    const interval =
      this.selectedExchange === this.binanceStr
        ? this.mappedResolutions[resolution]
        : this.mappedResolutions[resolution]
    if (!interval) {
      onErrorCallback('Invalid interval')
    }

    let totalKlines = []
    const kLinesLimit = 500
    const finishKlines = () => {
      if (this.debug) {
        console.log('📊:', totalKlines.length)
      }
      localStorage.setItem('lastSocketData', new Date().getTime())
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
        const symbolAPI =
          this.selectedExchange === this.binanceStr ||
          this.selectedExchange === this.binanceUSStr
            ? symbolInfo.name.replace('/', '')
            : symbolInfo.name

        const data = await this.binanceAPI.getKlines(
          symbolAPI,
          this.mappedResolutions[resolution],
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
        console.error(e)
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
    if (
      this.selectedExchange === this.binanceStr ||
      this.selectedExchange === this.binanceUSStr
    ) {
      this.ws.subscribeOnStream(
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscriberUID,
        onResetCacheNeededCallback
      )
    } else if (this.selectedExchange === this.ftxStr) {
      const pollingAPI = async () => {
        try {
          const klines = await this.ftxAPI.getKlines(
            symbolInfo.name,
            this.mappedResolutions[resolution],
            undefined,
            null,
            500
          )
          const kline = klines[klines.length - 1]
          const cbData = {
            time: kline[0],
            open: kline[1],
            high: kline[2],
            low: kline[3],
            close: kline[4],
            volume: kline[5],
          }
          return cbData
        } catch (e) {
          console.log(e)
        }
      }
      this.pollingInterval = setInterval(async () => {
        const data = await pollingAPI()
        onRealtimeCallback(data)
      }, 3000)
    }
  }

  unsubscribeBars(subscriberUID) {
    this.debug && console.log(`UnSub`, this.selectedExchange)
    if (
      this.selectedExchange === this.binanceStr ||
      this.selectedExchange === this.binanceUSStr
    ) {
      this.ws.unsubscribeFromStream(subscriberUID)
    } else if (this.selectedExchange === this.ftxStr) {
      clearInterval(this.pollingInterval)
    }
  }

  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    userInput = userInput.toUpperCase()
    onResultReadyCallback(
      this.symbols
        .filter((symbol) => {
          return symbol.symbol.indexOf(userInput) >= 0
        })
        .map((symbol) => {
          return {
            symbol: symbol.symbol,
            full_name: symbol.symbol,
            description: symbol.baseAsset + ' / ' + symbol.quoteAsset,
            ticker: symbol.symbol,
            exchange: EXCHANGE_SYMBOL[this.selectedExchange],
            type: 'crypto',
          }
        })
    )
  }
}
