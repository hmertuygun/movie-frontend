import { options } from '../constants/ExchangesList'
export const getExchangeProp = (exchange, property) => {
  return options.find((exc) => exchange === exc.value)[property]
}
export const execExchangeFunc = (exchange, property, params) => {
  return options.find((exc) => exchange === exc.value)[property](params)
}
