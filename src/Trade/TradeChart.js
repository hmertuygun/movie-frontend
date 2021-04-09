import React, { useContext, useEffect, useState } from 'react'
import { useSymbolContext } from './context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import TradingViewChart from './components/TradingViewChart/TradingViewChart'
import { useLocalStorage } from '@rehooks/local-storage'
import { getChartIntervals, saveChartIntervals } from '../api/api'
const TradeChart = () => {
  const { selectedSymbol, isLoading } = useSymbolContext()
  const { userData } = useContext(UserContext)
  const [fecthingIntervals, setFetchingIntervals] = useState(true)
  const [intervals, setIntervals] = useState([])
  const [lsValue] = useLocalStorage('tradingview.IntervalWidget.quicks')

  const getSavedIntervals = async () => {
    try {
      const data = await getChartIntervals()
      setIntervals(data)
    }
    catch (e) {
      console.log(e)
    }
    finally {
      setFetchingIntervals(false)
    }
  }

  useEffect(() => {
    getSavedIntervals()
  }, [])

  useEffect(() => {
    if (lsValue && lsValue.length) saveChartIntervals(lsValue)
  }, [lsValue])

  if (!selectedSymbol['value'] || fecthingIntervals) return null

  localStorage.setItem('selectedSymbol', selectedSymbol['value'])
  return (
    <TradingViewChart
      email={userData?.email}
      symbol={selectedSymbol['value']}
      theme={"light"}
      intervals={intervals}
    />
  )
}

export default TradeChart
