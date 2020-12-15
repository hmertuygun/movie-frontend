import React from 'react'
import TradingViewWidget, { Themes } from 'react-tradingview-widget'

const TradeChart = () => (
  <TradingViewWidget
    symbol="BINANCE:BTCUSDT"
    theme={Themes.DARK}
    hide_side_toolbar={false}
    autosize={true}
  />
)

export default TradeChart
