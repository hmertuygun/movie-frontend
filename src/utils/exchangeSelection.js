import { CONFIGS } from 'services/exchanges/Configs'
import { storage } from 'services/storages'

const getExchangeFunction = (exchange, funcName) => {
  if (CONFIGS[exchange]) return CONFIGS[exchange]['functions'][funcName]
}

const getSelectedExchange = (exchange) => {
  return storage.get('selectedExchange') || exchange
}

const getSelectedSymbol = async (symbol) => {
  await new Promise((resolve) => setTimeout(resolve, 1000)) //Added a small delay to get the exact exchange value, will be removed once we implement stores
  return storage.get('selectedSymbol') || symbol
}

export { getExchangeFunction, getSelectedExchange, getSelectedSymbol }
