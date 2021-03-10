import React from 'react'
import TradingViewWidget, { Themes } from 'react-tradingview-widget'
import { useSymbolContext } from './context/SymbolContext'
import TradingViewChart from './components/TradingViewChart/TradingViewChart'
const TradeChart = () => {
  const { selectedSymbol, isLoading } = useSymbolContext()
  // const theme = window.matchMedia('(prefers-color-scheme: light').matches
  //   ? Themes.LIGHT
  //   : Themes.LIGHT

  // if (isLoading) {
  //   return (
  //     <div className="spinner-border text-primary" role="status">
  //       <span className="sr-only">Loading...</span>
  //     </div>
  //   )
  // }

  const chartOptions = {
    symbol: selectedSymbol['value'] || 'BTCUSDT'
  }
  return (
    <TradingViewChart
      chartOptions={chartOptions}
    />
    // <TradingViewWidget
    //   symbol={selectedSymbol['value'] || ''}
    //   theme={Themes.LIGHT}
    //   hide_side_toolbar={false}
    //   autosize={true}
    //   allow_symbol_change={false}
    // />
  )
}

export default TradeChart
