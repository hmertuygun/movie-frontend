import React, { useContext, useEffect } from 'react'
import { useSymbolContext } from './context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import TradingViewChart from './components/TradingViewChart/TradingViewChart'
import { useLocalStorage } from '@rehooks/local-storage';
const TradeChart = () => {
  const { selectedSymbol, isLoading } = useSymbolContext()
  const { userData } = useContext(UserContext)
  const [lsValue] = useLocalStorage('tradingview.IntervalWidget.quicks')

  useEffect(() => {
    console.log(lsValue)
  }, [lsValue])

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
