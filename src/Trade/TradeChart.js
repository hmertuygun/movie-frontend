import React from 'react'
import { useSymbolContext } from './context/SymbolContext'
import TradingViewChart from './components/TradingViewChart/TradingViewChart'
const TradeChart = () => {
  const { selectedSymbol, isLoading } = useSymbolContext()
  return (
    <TradingViewChart
      symbol={selectedSymbol['value']}
      theme={"light"}
    />
  )
}

export default TradeChart
