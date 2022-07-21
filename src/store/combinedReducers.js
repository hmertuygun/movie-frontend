import { combineReducers } from 'redux'
import {
  symbols,
  exchanges,
  refresh,
  orders,
  emojis,
  templates,
  trades,
  market,
  apiKeys,
  users,
  appFlow,
  subscriptions,
  charts,
  analytics,
  portfolio,
  simpleTrade,
  notifications,
} from './reducers'

const reducers = combineReducers({
  notifications: notifications,
  symbols: symbols,
  exchanges: exchanges,
  refresh: refresh,
  orders: orders,
  emojis: emojis,
  templates: templates,
  trades: trades,
  market: market,
  apiKeys: apiKeys,
  users: users,
  appFlow: appFlow,
  subscriptions: subscriptions,
  charts: charts,
  analytics: analytics,
  portfolio: portfolio,
  simpleTrade: simpleTrade,
})

export default reducers
