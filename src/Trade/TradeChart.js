import React from 'react'
import TradingViewWidget, { Themes } from 'react-tradingview-widget'
import { useSymbolContext } from './context/SymbolContext'

const TradeChart = () => {
  const { selectedSymbol, isLoading } = useSymbolContext()

  const theme = window.matchMedia('(prefers-color-scheme: light').matches
    ? Themes.LIGHT
    : Themes.LIGHT

  if (isLoading) {
    return (
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  return (
    <TradingViewWidget
      symbol={selectedSymbol['value'] || ''}
      theme={Themes.LIGHT}
      hide_side_toolbar={false}
      autosize={true}
      allow_symbol_change={false}
    />
  )
}

export default TradeChart
