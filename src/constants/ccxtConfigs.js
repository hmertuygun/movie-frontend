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
}
