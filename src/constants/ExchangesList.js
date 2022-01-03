import * as yup from 'yup'

import Binance from '../api/functions/binance.js'
import BinanceUS from '../api/functions/binanceus'
import KuCoin from '../api/functions/kucoin'
import ByBit from '../api/functions/bybit'

import KlineSocket from '../api/KlineSocket'

export const EXCHANGE_SYMBOL = {
  binance: 'BINANCE',
  binanceus: 'BINANCEUS',
  ftx: 'FTX',
  bybit: 'BYIT',
}

export const options = [
  {
    value: 'binance',
    label: 'Binance',
    placeholder: 'Binance',
    symbol: 'BINANCE',
    fields: { Key: 'apiKey', Secret: 'secret' },
    socketUrl: Binance.getSocketEndpoint,
    socketEndpoint: 'wss://stream.binance.com:9443/ws',
    apiUrl: 'https://api2.binance.com',
    socketClass: KlineSocket,
    needPingAlive: false,
    resolutions: [
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
    ],
    mappedResolutions: {
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
    },
    mappedResolutionsSocket: {
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
    },
    getKlines: Binance.getKlines,
    editSymbol: Binance.editSymbol,
    editKline: Binance.editKline,
    onSocketMessage: Binance.onSocketMessage,
    initSubscribe: Binance.initSubscribe,
    editSocketData: Binance.editSocketData,
    socketSubscribe: Binance.socketSubscribe,
    klineSocketUnsubscribe: Binance.klineSocketUnsubscribe,
    getIncomingSocket: Binance.getIncomingSocket,
    fetchTicker: Binance.fetchTicker,
  },
  {
    value: 'binanceus',
    label: 'Binance.US',
    placeholder: 'BinanceUS',
    fields: { Key: 'apiKey', Secret: 'secret' },
    socketUrl: BinanceUS.getSocketEndpoint,
    socketEndpoint: 'wss://stream.binance.us:9443/ws',
    symbol: 'BINANCEUS',
    apiUrl: 'https://api.binance.us',
    socketClass: KlineSocket,
    needPingAlive: false,
    resolutions: [
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
    ],
    mappedResolutions: {
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
    },
    mappedResolutionsSocket: {
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
    },
    getKlines: BinanceUS.getKlines,
    editSymbol: BinanceUS.editSymbol,
    editKline: BinanceUS.editKline,
    onSocketMessage: BinanceUS.onSocketMessage,
    initSubscribe: BinanceUS.initSubscribe,
    editSocketData: BinanceUS.editSocketData,
    socketSubscribe: BinanceUS.socketSubscribe,
    klineSocketUnsubscribe: BinanceUS.klineSocketUnsubscribe,
    getIncomingSocket: BinanceUS.getIncomingSocket,
    fetchTicker: BinanceUS.fetchTicker,
  },
  {
    value: 'kucoin',
    label: 'KuCoin',
    placeholder: 'KuCoin',
    fields: { Key: 'apiKey', Secret: 'secret', Passphrase: 'password' },
    socketUrl: KuCoin.getSocketEndpoint,
    symbol: 'KUCOIN',
    apiUrl: 'https://api.kucoin.com',
    socketClass: KlineSocket,
    needPingAlive: true,
    getKlines: KuCoin.getKlines,
    editSymbol: KuCoin.editSymbol,
    editKline: KuCoin.editKline,
    onSocketMessage: KuCoin.onSocketMessage,
    initSubscribe: KuCoin.initSubscribe,
    fetchTickers: KuCoin.fetchTickers,
    editMessage: KuCoin.editMessage,
    editSocketData: KuCoin.editSocketData,
    socketSubscribe: KuCoin.socketSubscribe,
    klineSocketUnsubscribe: KuCoin.klineSocketUnsubscribe,
    preparePing: KuCoin.preparePing,
    getIncomingSocket: KuCoin.getIncomingSocket,
    fetchTicker: KuCoin.fetchTicker,
    resolutions: [
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
    ],
    mappedResolutions: {
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
      W: '1w',
      '1W': '1w',
    },
    mappedResolutionsSocket: {
      1: '1min',
      3: '3min',
      5: '5min',
      15: '15min',
      30: '30min',
      60: '1hour',
      120: '2hour',
      240: '4hour',
      360: '6hour',
      480: '8hour',
      720: '12hour',
      D: '1day',
      '1D': '1day',
      W: '1week',
      '1W': '1week',
    },
  },
  {
    value: 'bybit',
    label: 'ByBit',
    placeholder: 'ByBit',
    fields: { Key: 'apiKey', Secret: 'secret' },
    socketUrl: ByBit.getSocketEndpoint,
    socketEndpoint: 'wss://stream.bybit.com/spot/quote/ws/v1',
    symbol: 'BYBIT',
    apiUrl: 'https://api.bybit.com',
    klineLimit: 200,
    needPingAlive: true,
    socketClass: KlineSocket,
    getKlines: ByBit.getKlines,
    editSymbol: ByBit.editSymbol,
    editKline: ByBit.editKline,
    onSocketMessage: ByBit.onSocketMessage,
    editMessage: ByBit.editMessage,
    editSocketData: ByBit.editSocketData,
    fetchTickers: ByBit.fetchTickers,
    socketSubscribe: ByBit.socketSubscribe,
    klineSocketUnsubscribe: ByBit.klineSocketUnsubscribe,
    preparePing: ByBit.preparePing,
    getIncomingSocket: ByBit.getIncomingSocket,
    fetchTicker: ByBit.fetchTicker,
    resolutions: [
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
    ],
    mappedResolutions: {
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
      W: '1w',
      '1W': '1w',
    },
    mappedResolutionsSocket: {
      1: '1m',
      3: '3m',
      5: '5m',
      15: '15m',
      30: '30m',
      60: '1h',
      120: '2h',
      240: '4h',
      360: '6h',
      D: '1d',
      '1D': '1d',
      W: '1w',
      '1W': '1w',
      M: '1m',
    },
  },
]

export const validationRules = {
  exchange: yup.string().required('Exchange is required'),
  apiName: yup
    .string()
    .required('API Name is required')
    .min(3, 'Must be at least 3 characters')
    .matches(/^[a-zA-Z0-9]+$/, {
      message: 'Accepted characters are A-Z, a-z and 0-9.',
      excludeEmptyString: true,
    }),
  apiKey: yup
    .string()
    .required('API Key is required')
    .min(3, 'Must be at least 3 characters'),
  secret: yup.string().required('API Secret is required'),
  password: yup.string().required('Passphrase is required'),
}
