import ccxt from 'ccxt'
import ccxtPro from 'ccxt.pro'

export const ccxtConfigs = {
  binance: {
    ratelimit: true,
  },
  binanceus: {
    ratelimit: true,
  },
  kucoin: {
    proxy: localStorage.getItem('proxyServer'),
    rateLimit: true,
  },
  ftx: {
    proxy: localStorage.getItem('proxyServer'),
    rateLimit: true,
  },
  bybit: {
    proxy: localStorage.getItem('proxyServer'),
    rateLimit: true,
  },
  okex: {
    proxy: localStorage.getItem('proxyServer'),
    rateLimit: true,
  },
}

export const ccxtClass = {
  binance: new ccxtPro.binance({
    ratelimit: true,
  }),
  binanceus: new ccxtPro.binanceus({
    ratelimit: true,
  }),
  kucoin: new ccxtPro.kucoin({
    proxy: localStorage.getItem('proxyServer'),
    rateLimit: true,
  }),
  ftx: new ccxtPro.ftx({
    proxy: localStorage.getItem('proxyServer'),
    rateLimit: true,
  }),
  bybit: new ccxtPro.bybit({
    proxy: localStorage.getItem('proxyServer'),
    rateLimit: true,
  }),
  huobipro: new ccxtPro.huobi({
    rateLimit: true,
  }),
  okex: new ccxtPro.okex({
    proxy: localStorage.getItem('proxyServer'),
    rateLimit: true,
  }),
}
