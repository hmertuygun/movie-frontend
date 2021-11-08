export const TWO_DECIMAL_ARRAY = ['USDT', 'PAX', 'BUSD', 'USDC']

export const orderType = {
  limit: 'Limit',
  'stop-limit': 'Stop-Limit',
  'stop-market': 'Stop-Market',
}

export const TRADE_TABLE_LABELS = [
  { text: 'Type' },
  { text: 'Price' },
  { text: 'Profit' },
  { text: 'Amount' },
  { text: '' },
]

export const ONBOARDING_MODAL_TEXTS = {
  1: {
    primaryBtn: 'Continue with existing exchange account',
    secBtn: 'Set up a new Binance account',
    title: 'Exchange Setup',
    heading: 'Welcome to CoinPanel!',
    terBtn: 'Go to Chart Mirroring',
    text1: 'You need an exchange account to use CoinPanel.',
    text2:
      'Do you have an existing account that you would like to connect, or would you like to create a new exchange account?',
  },
  2: {
    primaryBtn: 'Continue',
    secBtn: 'Go Back',
    heading: 'Connect your exchange account',
  },
  3: {
    primaryBtn: 'Start the CoinPanel experience',
    secBtn: 'Checkout the tutorials',
    heading: 'Exchange integration complete!',
  },
}

export const DEFAULT_WATCHLIST = 'Watch List'

export const WATCHLIST_INIT_STATE = {
  activeList: DEFAULT_WATCHLIST,
  lists: {
    [DEFAULT_WATCHLIST]: { watchListName: DEFAULT_WATCHLIST },
  },
}
