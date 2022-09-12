import { combineReducers } from 'redux'
import {
  symbols,
  exchanges,
  refresh,
  orders,
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
  analysts,
  watchlist,
  notifications,
} from './reducers'

const reducers = combineReducers({
  notifications: notifications,
  symbols: symbols,
  exchanges: exchanges,
  refresh: refresh,
  orders: orders,
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
  analysts: analysts,
  watchlist: watchlist,
  simpleTrade: simpleTrade,
})

export default reducers
