const DEFAULT_SYMBOL = 'BINANCE:BTC/USDT'
const DEFAULT_SYMBOL_LOAD_SLASH = 'BTC/USDT'
const DEFAULT_SYMBOL_LOAD_DASH = 'BTC-USDT'
const DEFAULT_EXCHANGE = 'BINANCE'
const DEFAULT_EMOJIS = [
  { id: 1, emoji: '', text: '' },
  { id: 2, emoji: '', text: '' },
  { id: 3, emoji: '', text: '' },
  { id: 4, emoji: '', text: '' },
  { id: 5, emoji: '', text: '' },
]

const DEFAULT_ACTIVE_EXCHANGE = [
  {
    apiKeyName: 'default',
    exchange: 'binance',
    status: 'Active',
    default: true,
    isLastSelected: true,
  },
]

export {
  DEFAULT_SYMBOL,
  DEFAULT_SYMBOL_LOAD_SLASH,
  DEFAULT_SYMBOL_LOAD_DASH,
  DEFAULT_EXCHANGE,
  DEFAULT_EMOJIS,
  DEFAULT_ACTIVE_EXCHANGE,
}
