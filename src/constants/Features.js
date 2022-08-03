// need to define all features here for both Normal and Canary users which needs permission
const commonFeatures = ['watchlists']
const FEATURES = {
  canary: [...commonFeatures, 'orderbook', 'analyst-comments'],
  normal: [...commonFeatures, 'watchlist-flags', 'templates ß'],
}

const commonExchanges = [
  'binance',
  'binanceus',
  'kucoin',
  'bybit',
  'huobipro',
  'okex',
]

// Allowed exchanges
const ALLOWED_EXCHANGES = {
  canary: [...commonExchanges, 'kraken', 'coinbase'],
  normal: [...commonExchanges],
}

export { FEATURES, ALLOWED_EXCHANGES }
