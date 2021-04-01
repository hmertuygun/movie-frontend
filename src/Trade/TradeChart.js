import React, { useContext } from 'react'
import { useSymbolContext } from './context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import TradingViewChart from './components/TradingViewChart/TradingViewChart'
const TradeChart = () => {
  const { selectedSymbol, isLoading } = useSymbolContext()
  const { userData } = useContext(UserContext)
  if (!selectedSymbol['value']) return null
  localStorage.setItem('selectedSymbol', selectedSymbol['value'])
  return (
    <TradingViewChart
      email={userData?.email}
      symbol={selectedSymbol['value']}
      theme={"light"}
    />
  )
}

export default TradeChart
