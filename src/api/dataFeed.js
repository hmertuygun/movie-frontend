import { getExchangeProp, execExchangeFunc } from '../helpers/getExchangeProp'
export default class dataFeed {
  constructor({ exchange, symbolList, marketSymbols, debug }) {
    this.selectedExchange = exchange
    this.symbolList = symbolList
    this.marketSymbols = marketSymbols
    this.mappedResolutions = getExchangeProp(
      this.selectedExchange,
      'mappedResolutions'
    )
    this.debug = debug
    this.socketClass = getExchangeProp(this.selectedExchange, 'socketClass')
    this.ws = new this.socketClass()
  }
  onReady(callback) {
    setTimeout(() => {
      callback({
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
        supported_resolutions: getExchangeProp(
          this.selectedExchange,
          'resolutions'
        ),
      })
    }, 0)
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    try {
      let chosenSymbol = symbolName
      let symbol = getExchangeProp(this.selectedExchange, 'symbol')
      this.selectedExchange = localStorage.getItem('selectedExchange')
      const selectedSymbol = `${symbol}:${chosenSymbol}`
      const selectedSymbolDetail =
        this.marketSymbols && this.marketSymbols[selectedSymbol]
      setTimeout(() => {
        onSymbolResolvedCallback({
          name: chosenSymbol,
          description: chosenSymbol,
          ticker: chosenSymbol,
          exchange: symbol,
          listed_exchange: symbol,
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
      }, 100)
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
    let totalKlines = []
    let kLinesLimit = 500
    const finishKlines = () => {
      if (this.debug) {
        console.log('📊:', totalKlines.length)
      }
      localStorage.setItem('lastSocketData', new Date().getTime())
      if (totalKlines && totalKlines.length === 0) {
        onHistoryCallback([], { noData: true })
      } else {
        let historyCBArray =
          totalKlines &&
          execExchangeFunc(this.selectedExchange, 'editKline', {
            klines: totalKlines,
          })
        onHistoryCallback(historyCBArray, { noData: false })
      }
    }

    const getKlines = async (from, to) => {
      try {
        const symbolAPI = execExchangeFunc(
          this.selectedExchange,
          'editSymbol',
          { symbol: symbolInfo }
        )
        if (
          !(
            symbolAPI ||
            this.mappedResolutions[resolution] ||
            from ||
            to ||
            kLinesLimit
          )
        )
          return
        let data = []

        data = await execExchangeFunc(this.selectedExchange, 'getKlines', {
          symbol: symbolAPI,
          interval: this.mappedResolutions[resolution],
          startTime: from,
          endTime: to,
          limit: kLinesLimit,
        })

        totalKlines = totalKlines && totalKlines.concat(data)
        if (data.length === kLinesLimit) {
          from = data[data.length - 1][0] + 1
          getKlines(from, to)
        } else {
          finishKlines()
        }
      } catch (e) {
        console.error(e)
        onErrorCallback(`Error in 'getKlines' function`)
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

  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    userInput = userInput.toUpperCase()
    onResultReadyCallback(
      this.symbolList
        .filter((symbol) => {
          return symbol.symbol.indexOf(userInput) >= 0
        })
        .map((symbol) => {
          return {
            symbol: symbol.symbol,
            full_name: symbol.symbol,
            description: symbol.baseAsset + ' / ' + symbol.quoteAsset,
            ticker: symbol.symbol,
            exchange: getExchangeProp(this.selectedExchange, 'symbol'),
            type: 'crypto',
          }
        })
    )
  }
}
