'use strict'

// ----------------------------------------------------------------------------

const ccxt = require('ccxt')
const Precise = require('ccxt').Precise
const { ExchangeError } = require('ccxt/js/base/errors')
const {
  ArrayCache,
  ArrayCacheByTimestamp,
  ArrayCacheBySymbolById,
} = require('./base/Cache')

// ----------------------------------------------------------------------------

module.exports = class bybit extends ccxt.bybit {
  describe() {
    return this.deepExtend(super.describe(), {
      has: {
        ws: true,
        watchBalance: false,
        watchMyTrades: false,
        watchOHLCV: false,
        watchOrderBook: false,
        watchOrders: false,
        watchTicker: true,
        watchTickers: false, // for now
        watchTrades: false,
      },
      urls: {
        test: {
          ws: {
            spot: 'wss://stream-testnet.bybit.com/realtime_public',
            linear: 'wss://stream-testnet.bybit.com/realtime_public',
            future: 'wss://stream-testnet.bybit.com/realtime_public',
            delivery: 'wss://stream-testnet.bybit.com/realtime_public',
          },
        },
        api: {
          ws: {
            spot: 'wss://stream.bybit.com/realtime_public',
            linear: 'wss://stream.bybit.com/realtime_public',
            future: 'wss://stream.bybit.com/realtime_public',
            delivery: 'wss://stream.bybit.com/realtime_public',
          },
        },
      },
      options: {
        // get updates every 1000ms or 100ms
        // or every 0ms in real-time for futures
        watchOrderBookRate: 100,
        tradesLimit: 1000,
        ordersLimit: 1000,
        OHLCVLimit: 1000,
        requestId: {},
        watchOrderBookLimit: 1000, // default limit
        watchTrades: {
          name: 'trade', // 'trade' or 'aggTrade'
        },
        watchTicker: {
          name: 'ticker', // ticker = 1000ms L1+OHLCV, bookTicker = real-time L1
        },
        watchBalance: {
          fetchBalanceSnapshot: false, // or true
          awaitBalanceSnapshot: true, // whether to wait for the balance snapshot before providing updates
        },
        wallet: 'wb', // wb = wallet balance, cw = cross balance
        listenKeyRefreshRate: 1200000, // 20 mins
        ws: {
          cost: 5,
        },
      },
    })
  }

  requestId(url) {
    const options = this.safeValue(this.options, 'requestId', {})
    const previousValue = this.safeInteger(options, url, 0)
    const newValue = this.sum(previousValue, 1)
    this.options['requestId'][url] = newValue
    return newValue
  }

  handleDelta(bookside, delta) {
    const price = this.safeFloat(delta, 0)
    const amount = this.safeFloat(delta, 1)
    bookside.store(price, amount)
  }

  handleDeltas(bookside, deltas) {
    for (let i = 0; i < deltas.length; i++) {
      this.handleDelta(bookside, deltas[i])
    }
  }

  async watchTicker(symbol, params = {}) {
    await this.loadMarkets()
    const market = this.market(symbol)
    const marketId = market['lowercaseId']
    const options = this.safeValue(this.options, 'watchTicker', {})
    const name = this.safeString(options, 'name', 'ticker')
    const messageHash = 'instrument_info.100ms.' + market.id
    const defaultType = this.safeString2(this.options, 'defaultType', 'spot')
    const watchTickerType = this.safeString2(
      options,
      'type',
      'defaultType',
      defaultType
    )
    const type = this.safeString(params, 'type', watchTickerType)
    const query = this.omit(params, 'type')
    const url = this.urls['api']['ws'][type]
    const requestId = this.requestId(url)
    const request = {
      op: 'subscribe',
      args: [messageHash],
    }
    const subscribe = {
      id: requestId,
    }

    return await this.watch(
      url,
      messageHash,
      this.extend(request, query),
      messageHash,
      subscribe
    )
  }

  handleTicker(client, message) {
    //
    // 24hr rolling window ticker statistics for a single symbol
    // These are NOT the statistics of the UTC day, but a 24hr rolling window for the previous 24hrs
    // Update Speed 1000ms
    //
    //     {
    //         e: '24hrTicker',      // event type
    //         E: 1579485598569,     // event time
    //         s: 'ETHBTC',          // symbol
    //         p: '-0.00004000',     // price change
    //         P: '-0.209',          // price change percent
    //         w: '0.01920495',      // weighted average price
    //         x: '0.01916500',      // the price of the first trade before the 24hr rolling window
    //         c: '0.01912500',      // last (closing) price
    //         Q: '0.10400000',      // last quantity
    //         b: '0.01912200',      // best bid
    //         B: '4.10400000',      // best bid quantity
    //         a: '0.01912500',      // best ask
    //         A: '0.00100000',      // best ask quantity
    //         o: '0.01916500',      // open price
    //         h: '0.01956500',      // high price
    //         l: '0.01887700',      // low price
    //         v: '173518.11900000', // base volume
    //         q: '3332.40703994',   // quote volume
    //         O: 1579399197842,     // open time
    //         C: 1579485597842,     // close time
    //         F: 158251292,         // first trade id
    //         L: 158414513,         // last trade id
    //         n: 163222,            // total number of trades
    //     }
    //
    let obj = {}
    let event = this.safeString(message, 'type')
    if (message.data?.update) {
      obj = message.data?.update[0]
    } else {
      obj = message.data
    }
    const messageHash = this.safeString(message, 'topic')
    const marketId = this.safeString(obj, 'symbol')
    const symbol = this.safeSymbol(marketId)
    const last = this.safeFloat(obj, 'last_price')
    const result = {
      symbol: symbol,
      high: this.safeFloat(obj, 'high_price_24h'),
      low: this.safeFloat(obj, 'low_price_24h'),
      bid: this.safeFloat(obj, 'bid1_price'),
      ask: this.safeFloat(obj, 'ask1_price'),
      last,
      percentage: this.safeInteger(obj, 'price_24h_pcnt_e6') / Math.pow(10, 6),
      baseVolume: this.safeInteger(obj, 'volume_24h_e8'),
      quoteVolume: this.safeFloat(obj, 'total_volume_e8'),
    }
    this.tickers[symbol] = result
    client.resolve(result, messageHash)
  }

  async keepAliveListenKey(params = {}) {
    // https://binance-docs.github.io/apidocs/spot/en/#listen-key-spot
    let type = this.safeString2(
      this.options,
      'defaultType',
      'authenticate',
      'spot'
    )
    type = this.safeString(params, 'type', type)
    const options = this.safeValue(this.options, type, {})
    const listenKey = this.safeString(options, 'listenKey')
    if (listenKey === undefined) {
      // A network error happened: we can't renew a listen key that does not exist.
      return
    }
    let method = 'publicPutUserDataStream'
    if (type === 'future') {
      method = 'fapiPrivatePutListenKey'
    } else if (type === 'delivery') {
      method = 'dapiPrivatePutListenKey'
    } else if (type === 'margin') {
      method = 'sapiPutUserDataStream'
    }
    const request = {
      listenKey: listenKey,
    }
    const time = this.milliseconds()
    const sendParams = this.omit(params, 'type')
    try {
      await this[method](this.extend(request, sendParams))
    } catch (error) {
      const url =
        this.urls['api']['ws'][type] + '/' + this.options[type]['listenKey']
      const client = this.client(url)
      const messageHashes = Object.keys(client.futures)
      for (let i = 0; i < messageHashes.length; i++) {
        const messageHash = messageHashes[i]
        client.reject(error, messageHash)
      }
      this.options[type] = this.extend(options, {
        listenKey: undefined,
        lastAuthenticatedTime: 0,
      })
      return
    }
    this.options[type] = this.extend(options, {
      listenKey: listenKey,
      lastAuthenticatedTime: time,
    })
    // whether or not to schedule another listenKey keepAlive request
    const clients = Object.values(this.clients)
    const listenKeyRefreshRate = this.safeInteger(
      this.options,
      'listenKeyRefreshRate',
      1200000
    )
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i]
      const subscriptionKeys = Object.keys(client.subscriptions)
      for (let j = 0; j < subscriptionKeys.length; j++) {
        const subscribeType = subscriptionKeys[j]
        if (subscribeType === type) {
          return this.delay(
            listenKeyRefreshRate,
            this.keepAliveListenKey,
            params
          )
        }
      }
    }
  }

  handleMessage(client, message) {
    const methods = {
      depthUpdate: this.handleOrderBook,
      trade: this.handleTrade,
      aggTrade: this.handleTrade,
      kline: this.handleOHLCV,
      '24hrTicker': this.handleTicker,
      bookTicker: this.handleTicker,
      outboundAccountPosition: this.handleBalance,
      balanceUpdate: this.handleBalance,
      ACCOUNT_UPDATE: this.handleBalance,
      executionReport: this.handleOrderUpdate,
      ORDER_TRADE_UPDATE: this.handleOrderUpdate,
    }
    const event = this.safeString(message, 'e')
    const method = this.safeValue(methods, '24hrTicker')
    if (method === undefined) {
      const requestId = this.safeString(message, 'cross_seq')
      if (requestId !== undefined) {
        return this.handleSubscriptionStatus(client, message)
      }
      // special case for the real-time bookTicker, since it comes without an event identifier
      //
      //     {
      //         u: 7488717758,
      //         s: 'BTCUSDT',
      //         b: '28621.74000000',
      //         B: '1.43278800',
      //         a: '28621.75000000',
      //         A: '2.52500800'
      //     }
      //
      if (event === undefined) {
        this.handleTicker(client, message)
      }
    } else {
      return method.call(this, client, message)
    }
  }
}
