import { addPrecisionToNumber } from './tradeForm'

const symbolObj = JSON.parse(localStorage.getItem('symbolsKeyValue'))

const unknownPairs = [
  'USDT',
  'BUSD',
  'USD',
  'USDC',
  'EUR',
  'AUD',
  'CAD',
  'HUSD',
  'GBP',
  'USDK',
  'DAI',
]

export const handleChangeTickSize = (value, symbol, useQuote = false) => {
  const exchange = localStorage.getItem('selectedExchange')
  const valueGot = useQuote ? 'quote_asset_precision' : 'base_asset_precision'
  if (symbol.includes('-') || symbol.includes('/')) {
    const tickSize =
      symbolObj[`${exchange.toUpperCase()}:${symbol.replace('-', '/')}`][
        valueGot
      ]
    return addPrecisionToNumber(value, tickSize)
  } else {
    if (!unknownPairs.includes(symbol)) {
      const tickSize =
        symbolObj[`${exchange.toUpperCase()}:${symbol}/USDT`][valueGot]
      return addPrecisionToNumber(value, tickSize)
    }
    return value
  }
}
