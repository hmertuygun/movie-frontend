import React, { useContext, useEffect, useState } from 'react'
import { useSymbolContext } from './context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import TradingViewChart from './components/TradingViewChart/TradingViewChart'
import { useLocalStorage } from '@rehooks/local-storage'
import { getChartIntervals, saveChartIntervals } from '../api/api'
const TradeChart = () => {
  const { selectedSymbol, symbols, symbolDetails, isLoading, selectedSymbolDetail } = useSymbolContext()
  const { userData, openOrdersUC, setOpenOrdersUC, delOpenOrders, activeExchange } = useContext(UserContext)
  const [fecthingIntervals, setFetchingIntervals] = useState(true)
  const [intervals, setIntervals] = useState([])
  const [lsValue] = useLocalStorage('tradingview.IntervalWidget.quicks')
  const [reRender, setReRender] = useState(new Date().getTime())
  const [exchangeType, setExchangeType] = useState(null)
  const [symbolType, setSymbolType] = useState(null)
  const [count, setCount] = useState(0)
  const [docVisibility, setDocVisibility] = useState(true)
  const [isChartReady, setIsChartReady] = useState(false)

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
      setDocVisibility(document.visibilityState === "visible" ? true : false)
    })
  }

  useEffect(() => {
    getSavedIntervals()
    reconnectWSOnWindowFocus()
  }, [])

  useEffect(() => {
    if (!count) return
    const savedTime = localStorage.getItem('lastSocketData')
    if (docVisibility && isChartReady && activeExchange.exchange === "binance" && (new Date().getTime() - savedTime) > 10000) {
      setReRender(new Date().getTime())
    }
  }, [docVisibility])

  useEffect(() => {
    setIsChartReady(false)
  }, [reRender])

  useEffect(() => {
    if (lsValue && lsValue.length) saveChartIntervals(lsValue)
  }, [lsValue])

  useEffect(() => {
    if (!selectedSymbol || !selectedSymbol.value) return
    const [exchange, symbol] = selectedSymbol.value.split(":")
    localStorage.setItem('selectedSymbol', symbol)
    // localStorage.setItem('selectedExchange', exchange.toLowerCase())
    // setExchangeType(exchange.toLowerCase())
    setSymbolType(symbol)
  }, [selectedSymbol])

  useEffect(() => {
    if (!activeExchange?.exchange || exchangeType === activeExchange.exchange) return
    localStorage.setItem('selectedExchange', activeExchange.exchange)
    setExchangeType(activeExchange.exchange)
    if (count > 0) {
      console.log('Re-rendered')
      setReRender(new Date().getTime())
    }
    setCount(prev => prev + 1)
  }, [activeExchange])

  if (!symbolType || !exchangeType) return null

  return (
    <TradingViewChart
      email={userData?.email}
      theme={"light"}
      intervals={intervals}
      openOrders={openOrdersUC}
      key={reRender}
      symbol={symbolType}
      exchange={exchangeType}
      marketSymbols={symbolDetails}
      chartReady={(e) => { setIsChartReady(e) }}
    />
  )
}

export default TradeChart
