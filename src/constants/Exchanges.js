const img_path = 'img/svg/exchange/'
const logo_path = 'img/icons/brands/'

const EXCHANGES = {
  binance: {
    value: 'binance',
    label: 'Binance',
    symbol: 'BINANCE',
    placeholder: 'Binance',
    fields: { Key: 'apiKey', Secret: 'secret' },
    socketEndpoint: 'wss://stream.binance.com:9443/ws',
    apiUrl: 'https://api2.binance.com',
    url: 'https://accounts.binance.com/en/register?ref=UR7ZCKEJ',
    image: `${img_path}binance.svg`,
    logo: `${logo_path}binance.svg`,
  },
  binanceus: {
    value: 'binanceus',
    label: 'Binance.US',
    symbol: 'BINANCEUS',
    placeholder: 'BinanceUS',
    fields: { Key: 'apiKey', Secret: 'secret' },
    socketEndpoint: 'wss://stream.binance.us:9443/ws',
    apiUrl: 'https://api.binance.us',
    url: 'https://accounts.binance.us/en/register',
    image: `${img_path}binanceus.svg`,
    logo: `${logo_path}binanceus.svg`,
  },
  kucoin: {
    value: 'kucoin',
    label: 'KuCoin',
    symbol: 'KUCOIN',
    placeholder: 'KuCoin',
    fields: { Key: 'apiKey', Secret: 'secret', Passphrase: 'password' },
    socketEndpoint: '',
    apiUrl: 'https://api.kucoin.com',
    url: 'https://www.kucoin.com/ucenter/signup?rcode=r3JHGQU',
    image: `${img_path}kucoin.svg`,
    logo: `${logo_path}kucoin.svg`,
  },
  bybit: {
    value: 'bybit',
    label: 'ByBit',
    symbol: 'BYBIT',
    placeholder: 'ByBit',
    fields: { Key: 'apiKey', Secret: 'secret' },
    socketEndpoint: 'wss://stream.bybit.com/spot/quote/ws/v1',
    apiUrl: 'https://api.bybit.com',
    url: 'https://partner.bybit.com/b/coinpanel',
    image: `${img_path}bybit.svg`,
    logo: `${logo_path}ByBit_Icon.png`,
  },
  huobipro: {
    value: 'huobipro',
    label: 'HuobiPro',
    symbol: 'HUOBIPRO',
    placeholder: 'Huobi Pro',
    fields: { Key: 'apiKey', Secret: 'secret' },
    socketEndpoint: 'wss://api-aws.huobi.pro/ws',
    apiUrl: 'https://api.huobi.pro',
    url: ' https://www.huobi.com/en-us/register/?inviter_id=11339800',
    image: `${img_path}huobipro.svg`,
    logo: `${logo_path}huobi.png`,
  },
  okex: {
    value: 'okex',
    label: 'OKEx',
    symbol: 'OKEx',
    placeholder: 'OKEx',
    fields: { Key: 'apiKey', Secret: 'secret', Passphrase: 'password' },
    socketEndpoint: 'wss://ws.okex.com:8443/ws/v5/public',
    apiUrl: 'https://www.okex.com/',
    url: 'https://www.okx.com/join/11966961',
    image: `${img_path}okex.svg`,
    logo: `${logo_path}okex.png`,
  },
  kraken: {
    value: 'kraken',
    label: 'Kraken',
    symbol: 'Kraken',
    placeholder: 'Kraken',
    fields: { Key: 'apiKey', Secret: 'secret' },
    socketEndpoint: 'wss://ws.kraken.com',
    apiUrl: 'https://api.kraken.com/',
    image: `${img_path}kraken.svg`,
    logo: `${logo_path}kraken.png`,
  },
}

const RESOLUTIONS = [
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
]

const DEFAULT_MAPPED_RESOLUTION = {
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
}

const MAPPED_RESOLUTIONS = {
  ...DEFAULT_MAPPED_RESOLUTION,
  480: '8h',
  720: '12h',
}

const MAPPED_RESOLUTION_T1 = {
  ...MAPPED_RESOLUTIONS,
  '3D': '3d',
  M: '1M',
  '1M': '1M',
}

const MAPPED_SOCKET_RESOLUTIONS = {
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
}

const MAPPED_SOCKET_RESOLUTION_T1 = {
  1: 'candle1m',
  3: 'candle3m',
  5: 'candle5m',
  15: 'candle15m',
  30: 'candle30m',
  60: 'candle1H',
  120: 'candle2H',
  240: 'candle4H',
  360: 'candle6H',
  D: 'candle1D',
  '1D': 'candle1D',
  W: 'candle1W',
  '1W': 'candle1W',
  M: 'candle1M',
}

export const RESOLUTIONS_K = [1, 5, 15, 30, 60, 240, '1D', '1W', '1M']

export const RESOLUTIONS_T2 = {
  1: 1,
  5: 5,
  15: 15,
  30: 30,
  60: 60,
  240: 240,
  '1D': 1440,
  '1W': 10080,
  '1M': 21600,
}

export {
  EXCHANGES,
  RESOLUTIONS,
  DEFAULT_MAPPED_RESOLUTION,
  MAPPED_RESOLUTIONS,
  MAPPED_RESOLUTION_T1,
  MAPPED_SOCKET_RESOLUTIONS,
  MAPPED_SOCKET_RESOLUTION_T1,
}
