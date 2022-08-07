import ccxtPro from 'ccxt.pro'
import { storage } from 'services/storages'

export const whitelistedUrl =
  'https://cp-cors-proxy-eu-west-ywasypvnmq-ew.a.run.app/'
const proxyServer = storage.get('proxyServer')
  ? storage.get('proxyServer')
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
  kraken: new ccxtPro.kraken({
    proxy: proxyServer,
    rateLimit: true,
  }),
}
