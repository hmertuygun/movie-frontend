import { ccxtClass } from 'constants/ccxtConfigs'
import { fetchExchangeTicker } from 'services/api'
import { getExchangeFunction } from 'utils/exchangeSelection'
import { CONFIGS } from './Configs'

const fetchTicker = async (exchange, symbol) => {
  const ticker = CONFIGS[exchange]['ticker']

  if (ticker === 'ccxt') return await ccxtClass[exchange].fetchTicker(symbol)
  const { data } = await fetchExchangeTicker(ticker, symbol.replace('/', ''))
  return {
    last: data.result.lastPrice,
    high: data.result.highPrice,
    low: data.result.lowPrice,
    baseVolume: data.result.volume,
    quoteVolume: data.result.quoteVolume,
    symbol: data.result.symbol,
  }
}

const getTickerData = async (exchange, data) => {
  const tickerFunc = await getExchangeFunction(exchange, 'getTickerData')
  return tickerFunc(data)
}

export { fetchTicker, getTickerData }
