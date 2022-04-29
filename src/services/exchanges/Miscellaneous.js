import pako from 'pako'
import { getExchangeFunction } from 'utils/exchangeSelection'
import { CONFIGS } from './Configs'

const getLastAndPercent = (exchange, args) => {
  const { data } = args
  const getLastAndPercentFunc = getExchangeFunction(
    exchange,
    'getLastAndPercent'
  )
  if (getLastAndPercentFunc) return getLastAndPercentFunc(data)
}

const resolveGzip = (data) => {
  return new Promise((resolve) => {
    var reader = new FileReader()
    reader.onload = function (event) {
      var result = pako.inflate(event.target.result, { to: 'string' })
      resolve(JSON.parse(result))
    }
    reader.readAsArrayBuffer(data)
  })
}

const editSymbol = (exchange, symbol) =>
  symbol.name.replace('/', CONFIGS[exchange]['char'])

const preparePing = (exchange) => CONFIGS[exchange]['ping']

export { getLastAndPercent, resolveGzip, editSymbol, preparePing }
