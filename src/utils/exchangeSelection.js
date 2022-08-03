import { EXCHANGES } from 'constants/Exchanges'
import { ALLOWED_EXCHANGES } from 'constants/Features'
import _ from 'lodash'
import { CONFIGS } from 'services/exchanges/Configs'
import { storage } from 'services/storages'
import store from 'store'

const getExchangeFunction = (exchange, funcName) => {
  if (CONFIGS[exchange]) return CONFIGS[exchange]['functions'][funcName]
}

const getSelectedExchange = (exchange) => {
  return storage.get('selectedExchange') || exchange
}

const getAllowedExchanges = () => {
  const allowedExchanges = userAllowedExchanges()
  const data = Object.entries(EXCHANGES)
    .map((exchange) => exchange[1])
    .filter((item) => allowedExchanges.includes(item.value))
  return _.isEmpty(data) ? [] : data
}

const userAllowedExchanges = () => {
  const { users } = store.getState()
  const { isCanaryUser } = users
  return ALLOWED_EXCHANGES[isCanaryUser ? 'canary' : 'normal']
}

export { getExchangeFunction, getSelectedExchange, getAllowedExchanges }
