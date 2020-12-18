import React from 'react'
import TradingViewWidget, { Themes } from 'react-tradingview-widget'
import { useSymbolContext } from './context/SymbolContext'

const TradeChart = () => {
  const { selectedSymbol, isLoading } = useSymbolContext()

  // const theme = window.matchMedia('(prefers-color-scheme: light').matches
  //   ? Themes.LIGHT
  //   : Themes.DARK

  const theme = Themes.DARK

  if (isLoading) {
    return null
  }

  return (
    <TradingViewWidget
      symbol={selectedSymbol}
      theme={theme}
      hide_side_toolbar={false}
      autosize={true}
      allow_symbol_change={false}
    />
  )
}

export default TradeChart
