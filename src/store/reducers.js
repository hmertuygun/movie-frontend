import emojiSlice from './emojis/EmojiSlice'
import exchangeSlice from './exchanges/ExchangeSlice'
import marketSlice from './market/MarketSlice'
import orderSlice from './orders/OrderSlice'
import refreshSlice from './refresh/RefreshSlice'
import symbolSlice from './symbols/SymbolSlice'
import templateSlice from './templates/TemplateSlice'
import tradeSlice from './trades/TradeSlice'
import apiKeysSlice from './apiKeys/ApiKeysSlice'
import usersSlice from './users/UsersSlice'
import appFlowSlice from './appFlow/AppFlowSlice'
import subscriptionSlice from './subscription/SubscriptionSlice'
import chartSlice from './charts/ChartSlice'
import analyticsSlice from './analytics/AnalyticsSlice'
import portfolioSlice from './portfolio/PortfolioSlice'
import simpleTradeSlice from './simpleTrade/SimpleTradeSlice'

const symbols = symbolSlice.reducer,
  exchanges = exchangeSlice.reducer,
  refresh = refreshSlice.reducer,
  orders = orderSlice.reducer,
  emojis = emojiSlice.reducer,
  templates = templateSlice.reducer,
  trades = tradeSlice.reducer,
  market = marketSlice.reducer,
  apiKeys = apiKeysSlice.reducer,
  users = usersSlice.reducer,
  appFlow = appFlowSlice.reducer,
  subscriptions = subscriptionSlice.reducer,
  charts = chartSlice.reducer,
  analytics = analyticsSlice.reducer,
  portfolio = portfolioSlice.reducer,
  simpleTrade = simpleTradeSlice.reducer

export {
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
}
