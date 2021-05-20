import binanceAPI from '../../../api/binanceAPI'
import ftxAPI from '../../../api/ftxAPI'
import binanceSockets from '../../../sockets/binanceSockets'
import precisionRound from '../../../helpers/precisionRound'
export default class dataFeed {
  constructor({ exchange, symbolList, marketSymbols, debug }) {
    this.binanceStr = "binance"
    this.ftxStr = "ftx"
    this.selectedExchange = exchange
    this.symbolList = symbolList
    this.ftxResolutions = ['1', '5', '15', '60', '240', '1D']
    this.binanceResolutions = ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '1W', '1M']
    this.mappedResolutions = {
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
    this.debug = debug
    this.binanceAPI = new binanceAPI()
    this.ftxAPI = new ftxAPI()
    this.ws = new binanceSockets()
    this.marketSymbols = marketSymbols
    this.pollingInterval = null
  }
  onReady(callback) {
    //console.log(`onReady`)
    callback({
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: true,
      supported_resolutions: this.selectedExchange === this.binanceStr ? this.binanceResolutions : this.ftxResolutions
    })
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    try {
      let chosenSymbol = symbolName // localStorage.getItem('selectedSymbol') ||
      this.selectedExchange = this.selectedExchange || localStorage.getItem('selectedExchange')
      const selectedSymbol = `${this.selectedExchange === this.binanceStr ? 'BINANCE' : 'FTX'}:${chosenSymbol}`
      const selectedSymbolDetail = this.marketSymbols[selectedSymbol]
      const calculatePriceScale = (tick) => {
        if (parseFloat(tick) >= 1) return 100
        else {
          let spl = tick.split(".")[1]
          let zeroCount = 1
          let splitStr = spl.split("")
          for (let i = 0; i < splitStr.length; i++) {
            if (splitStr[i] === "0") zeroCount++
            else break
          }
          return Math.pow(10, zeroCount)
        }
      }
      const priceTick = calculatePriceScale(selectedSymbolDetail?.originalTickSize || 1)
      onSymbolResolvedCallback({
        name: chosenSymbol,
        description: chosenSymbol,
        ticker: chosenSymbol,
        exchange: this.selectedExchange === this.binanceStr ? 'BINANCE' : 'FTX',
        listed_exchange: this.selectedExchange === this.binanceStr ? 'BINANCE' : 'FTX',
        type: 'crypto',
        session: '24x7',
        minmov: 1,
        pricescale: priceTick, // parseFloat(selectedSymbolDetail.tickSize),
        timezone: 'UTC',
        currency_code: chosenSymbol.split("/")[1],
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: true,
      })
    }
    catch (e) {
      console.log(e)
    }
  }

  getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
    //console.log(`getBars`)
    const interval = this.selectedExchange === this.binanceStr ? this.mappedResolutions[resolution] : this.mappedResolutions[resolution]
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
        let historyCBArray = totalKlines.map(kline => ({
          time: kline[0],
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4]),
          volume: parseFloat(kline[5])
        }))
        onHistoryCallback(historyCBArray, { noData: false })
      }
    }

    const getKlines = async (from, to) => {
      try {
        const symbolAPI = this.selectedExchange === this.binanceStr ? symbolInfo.name.replace('/', '') : symbolInfo.name
        const fromTime = this.selectedExchange === this.binanceStr ? from : undefined
        const data = this.selectedExchange === this.binanceStr ?
          await this.binanceAPI.getKlines(symbolAPI, this.mappedResolutions[resolution], from, to, kLinesLimit) :
          this.selectedExchange === this.ftxStr ?
            await this.ftxAPI.getKlines(symbolAPI, this.mappedResolutions[resolution], from, to, kLinesLimit) : []
        totalKlines = totalKlines.concat(data)
        if (data.length === kLinesLimit) {
          from = data[data.length - 1][0] + 1
          getKlines(from, to)
        } else {
          finishKlines()
        }
      }
      catch (e) {
        console.error(e)
        onErrorCallback(`Error in 'getKlines' func`)
      }
    }

    from *= 1000
    to *= 1000

    getKlines(from, to)
  }

  async subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
    this.debug && console.log(`Sub`, this.selectedExchange)
    if (this.selectedExchange === this.binanceStr) {
      this.ws.subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback)
    }
    else if (this.selectedExchange === this.ftxStr) {
      const pollingAPI = async () => {
        try {
          const klines = await this.ftxAPI.getKlines(symbolInfo.name, this.mappedResolutions[resolution], undefined, null, 500)
          const kline = klines[klines.length - 1]
          const cbData = {
            time: kline[0],
            open: kline[1],
            high: kline[2],
            low: kline[3],
            close: kline[4],
            volume: kline[5]
          }
          return cbData
        }
        catch (e) {
          console.log(e)
        }
      }
      // clearInterval(this.pollingInterval)
      this.pollingInterval = setInterval(async () => {
        const data = await pollingAPI()
        onRealtimeCallback(data)
      }, 3000)
    }
  }

  unsubscribeBars(subscriberUID) {
    this.debug && console.log(`UnSub`, this.selectedExchange)
    if (this.selectedExchange === this.binanceStr) {
      this.ws.unsubscribeFromStream(subscriberUID)
    }
    else if (this.selectedExchange === this.ftxStr) {
      clearInterval(this.pollingInterval)
    }
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
