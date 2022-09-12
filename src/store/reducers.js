import exchangeSlice from './exchanges/ExchangeSlice'
import marketReducer from './market/MarketSlice'
import orderSlice from './orders/OrderSlice'
import refreshSlice from './refresh/RefreshSlice'
import symbolSlice from './symbols/SymbolSlice'
import templateReducer from './templates/TemplateSlice'
import tradeSlice from './trades/TradeSlice'
import apiKeysReducer from './apiKeys/ApiKeysSlice'
import usersReducer from './users/UsersSlice'
import appFlowReducer from './appFlow/AppFlowSlice'
import subscriptionReducer from './subscription/SubscriptionSlice'
import chartReducer from './charts/ChartSlice'
import analyticsSlice from './analytics/AnalyticsSlice'
import portfolioSlice from './portfolio/PortfolioSlice'
import simpleTradeSlice from './simpleTrade/SimpleTradeSlice'
import analystsReducer from './analysts/AnalystsSlice'
import watchlistReducer from './watchlist/WatchlistSlice'
import { reducer as notificationsReducer } from 'reapop'

const symbols = symbolSlice.reducer,
  exchanges = exchangeSlice.reducer,
  refresh = refreshSlice.reducer,
  orders = orderSlice.reducer,
  templates = templateReducer,
  trades = tradeSlice.reducer,
  market = marketReducer,
  apiKeys = apiKeysReducer,
  users = usersReducer,
  appFlow = appFlowReducer,
  subscriptions = subscriptionReducer,
  charts = chartReducer,
  analytics = analyticsSlice.reducer,
  portfolio = portfolioSlice.reducer,
  simpleTrade = simpleTradeSlice.reducer,
  analysts = analystsReducer,
  watchlist = watchlistReducer,
  notifications = notificationsReducer()

export {
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
}
