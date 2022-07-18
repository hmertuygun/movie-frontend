import { storage } from 'services/storages'
import { EXCHANGE_OPTIONS } from 'constants/ExchangesList'
import { editKline, editSymbol, getKlines } from 'services/exchanges'
import { klineSocket } from 'services/websocket'
import { getSelectedExchange } from 'utils/exchangeSelection'
import { consoleLogger } from 'utils/logger'

export default class dataFeed {
  constructor({ exchange, symbolList, marketSymbols, debug }) {
    this.symbolList = symbolList
    this.marketSymbols = marketSymbols
    this.ws = null
    this.debug = debug
    if (exchange) this.getSocket(exchange)
  }

  async getSocket(exchange) {
    this.selectedExchange = getSelectedExchange(exchange)
    this.exchangeOptions = EXCHANGE_OPTIONS[this.selectedExchange]
    this.mappedResolutions = this.exchangeOptions['mappedResolutions']
    this.ws = new klineSocket(this.selectedExchange)
  }

  onReady(callback) {
    setTimeout(() => {
      try {
        callback({
          supports_marks: false,
          supports_timescale_marks: false,
          supports_time: true,
          supported_resolutions: this.exchangeOptions['resolutions'],
        })
      } catch (error) {
        console.log(error)
      }
    }, 1000)
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    try {
      let chosenSymbol = symbolName
      let symbol = this.exchangeOptions['symbol']
      this.selectedExchange = storage.get('selectedExchange')
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
      consoleLogger(e)
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
        consoleLogger('📊:', totalKlines.length)
      }
      storage.set('lastSocketData', new Date().getTime())
      if (
        (totalKlines && totalKlines.length === 0) ||
        totalKlines[0] === undefined
      ) {
        onHistoryCallback([], { noData: true })
      } else {
        let historyCBArray = totalKlines && editKline(totalKlines)
        onHistoryCallback(historyCBArray, { noData: false })
      }
    }

    const getKlinesDetails = async (from, to) => {
      try {
        const symbolAPI = editSymbol(this.selectedExchange, symbolInfo)
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

        data = await getKlines(this.selectedExchange, {
          symbol: symbolAPI,
          interval: this.mappedResolutions[resolution],
          startTime: from,
          endTime: to,
          limit: kLinesLimit,
        })

        totalKlines = totalKlines && totalKlines.concat(data)
        if (data && data.length === kLinesLimit) {
          from = data[data.length - 1][0] + 1
          await getKlinesDetails(from, to)
        } else {
          finishKlines()
        }
      } catch (e) {
        consoleLogger(e)
        onErrorCallback(`Error in 'getKlines' function`)
      }
    }

    from *= 1000
    to *= 1000
    getKlinesDetails(from, to)
  }

  async subscribeBars(
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback
  ) {
    if (this.ws)
      this.ws.subscribeOnStream(
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscriberUID,
        onResetCacheNeededCallback
      )
  }

  unsubscribeBars(subscriberUID) {
    if (this.ws) this.ws.unsubscribeFromStream(subscriberUID)
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
            exchange: this.exchangeOptions['symbol'],
            type: 'crypto',
          }
        })
    )
  }
}
