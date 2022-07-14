import { storage } from 'services/storages'
import { ccxtClass } from 'constants/ccxtConfigs'
import { getExchangeKlines } from 'services/api'
import { CONFIGS } from './Configs'
import { getExchangeFunction } from 'utils/exchangeSelection'
import { consoleLogger } from 'utils/logger'

const getKlines = async (exchange, data) => {
  let { symbol } = data
  let currentSymbol = storage.get('selectedSymbol').split('/').join('')
  const fsymbol = symbol.split('/').join('')
  const kline = CONFIGS[exchange]['kline']
  if (currentSymbol === fsymbol) {
    if (kline === 'ccxt') return await fetchOHLCV(exchange, data)
    return await getExchangeKlines(exchange, kline, data)
  }
}

const fetchOHLCV = async (exchange, data) => {
  const { symbol, interval } = data
  try {
    const fetchOHLCVFunc = getExchangeFunction(exchange, 'fetchOHLCV')
    if (fetchOHLCVFunc) return await fetchOHLCVFunc(data)
    else
      return await ccxtClass[exchange].fetchOHLCV(
        symbol,
        interval,
        data.startTime
      )
  } catch (error) {
    consoleLogger('bad symbol', error)
  }
}

const editKline = (klines) => {
  return klines.map((kline) => {
    const [time, open, high, low, close, volume] = kline
    return {
      time: parseInt(time),
      open: parseFloat(open),
      high: parseFloat(high),
      low: parseFloat(low),
      close: parseFloat(close),
      volume: parseFloat(volume),
    }
  })
}

export { getKlines, editKline }
