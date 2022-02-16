import ccxtPro from 'ccxt.pro'

export const whitelistedUrl =
  'https://cp-cors-proxy-eu-west-ywasypvnmq-ew.a.run.app/'
const proxyServer = localStorage.getItem('proxyServer')
  ? localStorage.getItem('proxyServer')
  : 'https://cp-cors-proxy-asia-northeast-ywasypvnmq-an.a.run.app/'

export const ccxtClass = {
  binance: new ccxtPro.binance({
    ratelimit: true,
  }),
  binanceus: new ccxtPro.binanceus({
    ratelimit: true,
  }),
  kucoin: new ccxtPro.kucoin({
    proxy: whitelistedUrl,
    rateLimit: true,
  }),
  bybit: new ccxtPro.bybit({
    proxy: proxyServer,
    rateLimit: true,
  }),
  huobipro: new ccxtPro.huobi({
    rateLimit: true,
  }),
  okex: new ccxtPro.okex({
    proxy: proxyServer,
    rateLimit: true,
  }),
}
