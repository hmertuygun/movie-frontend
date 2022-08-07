import { storage } from 'services/storages'
import {
  Binance,
  BinanceUS,
  Bybit,
  HuobiPro,
  Kucoin,
  Okex,
  Kraken,
} from './Functions'

const PROXY_SERVER = storage.get('proxyServer')
const CONFIGS = {
  binance: {
    kline: 'https://api2.binance.com/api/v1/klines',
    ticker: 'ccxt',
    ping: {},
    char: '',
    functions: {
      socketSubscribe: Binance.socketSubscribe,
      getIncomingSocket: Binance.getIncomingSocket,
    },
  },
  binanceus: {
    kline: 'https://api.binance.us/api/v1/klines',
    ticker: 'ccxt',
    ping: {},
    char: '',
    functions: {
      socketSubscribe: BinanceUS.socketSubscribe,
      getIncomingSocket: BinanceUS.getIncomingSocket,
    },
  },
  kucoin: {
    kline: 'ccxt',
    ticker: 'ccxt',
    ping: {
      id: '1545910590801',
      type: 'ping',
    },
    char: '/',
    functions: {
      socketSubscribe: Kucoin.socketSubscribe,
      editSocketData: Kucoin.editSocketData,
      getIncomingSocket: Kucoin.getIncomingSocket,
      getSocketEndpoint: Kucoin.getSocketEndpoint,
      klineSocketUnsubscribe: Kucoin.klineSocketUnsubscribe,
    },
  },
  bybit: {
    kline: `${PROXY_SERVER}https://api.bybit.com/spot/quote/v1/kline`,
    ticker: `${PROXY_SERVER}https://api.bybit.com/spot/quote/v1/ticker/24hr`,
    ping: { ping: 1535975085052 },
    char: '',
    functions: {
      socketSubscribe: Bybit.socketSubscribe,
      getIncomingSocket: Bybit.getIncomingSocket,
      tickerSocketSubscribe: Bybit.tickerSocketSubscribe,
      getLastAndPercent: Bybit.getLastAndPercent,
      editSocketData: Bybit.editSocketData,
      getTickerData: Bybit.getTickerData,
      klineSocketUnsubscribe: Bybit.klineSocketUnsubscribe,
    },
  },
  huobipro: {
    kline: 'ccxt',
    ticker: 'ccxt',
    ping: {
      action: 'ping',
      data: {
        ts: 1575537778295,
      },
    },
    char: '/',
    functions: {
      socketSubscribe: HuobiPro.socketSubscribe,
      editSocketData: HuobiPro.editSocketData,
      getIncomingSocket: HuobiPro.getIncomingSocket,
      tickerSocketSubscribe: HuobiPro.tickerSocketSubscribe,
      getTickerData: HuobiPro.getTickerData,
      getLastAndPercent: HuobiPro.getLastAndPercent,
      klineSocketUnsubscribe: HuobiPro.klineSocketUnsubscribe,
    },
  },
  okex: {
    kline: 'ccxt',
    ticker: 'ccxt',
    ping: { ping: 1535975085052 },
    char: '/',
    functions: {
      socketSubscribe: Okex.socketSubscribe,
      editSocketData: Okex.editSocketData,
      klineSocketUnsubscribe: Okex.klineSocketUnsubscribe,
      getIncomingSocket: Okex.getIncomingSocket,
      tickerSocketSubscribe: Okex.tickerSocketSubscribe,
      getTickerData: Okex.getTickerData,
      getLastAndPercent: Okex.getLastAndPercent,
      fetchOHLCV: Okex.fetchOHLCV,
    },
  },
  kraken: {
    kline: 'ccxt',
    ticker: 'ccxt',
    ping: {
      event: 'ping',
      reqid: 42,
    },
    char: '/',
    functions: {
      socketSubscribe: Kraken.socketSubscribe,
      editSocketData: Kraken.editSocketData,
      klineSocketUnsubscribe: Kraken.klineSocketUnsubscribe,
      getIncomingSocket: Kraken.getIncomingSocket,
      fetchOHLCV: Kraken.fetchOHLCV,
      getLastAndPercent: Kraken.getLastAndPercent,
    },
  },
}

export { CONFIGS }
