import React, { useContext, useEffect, useState } from 'react'
import { useSymbolContext } from './context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import TradingViewChart from './components/TradingViewChart/TradingViewChart'
import { useLocalStorage } from '@rehooks/local-storage'
import { getChartIntervals, saveChartIntervals } from '../api/api'
const TradeChart = () => {
  const { selectedSymbol, isLoading } = useSymbolContext()
  const { userData, openOrdersUC, setOpenOrdersUC } = useContext(UserContext)
  const [fecthingIntervals, setFetchingIntervals] = useState(true)
  const [intervals, setIntervals] = useState([])
  const [lsValue] = useLocalStorage('tradingview.IntervalWidget.quicks')
  const [reRender, setReRender] = useState(new Date().getTime())

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

  const reconnectWSOnWindowFocus = () => {
    document.addEventListener('visibilitychange', (ev) => {
      const savedTime = localStorage.getItem('lastSocketData')

      if (document.visibilityState === "visible" && (new Date().getTime() - savedTime) > 10000) {
        console.log(`Re-render`)
        setReRender(new Date().getTime())
      }
    })
  }

  useEffect(() => {
    getSavedIntervals()
    reconnectWSOnWindowFocus()
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
      openOrders={openOrdersUC}
      key={reRender}
    />
  )
}

export default TradeChart
