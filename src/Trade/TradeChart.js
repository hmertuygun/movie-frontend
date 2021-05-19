import React, { useContext, useEffect, useState } from 'react'
import { useSymbolContext } from './context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import TradingViewChart from './components/TradingViewChart/TradingViewChart'
import { useLocalStorage } from '@rehooks/local-storage'
import { getChartIntervals, saveChartIntervals } from '../api/api'
const TradeChart = () => {
  const {
    selectedSymbol,
    symbols,
    symbolDetails,
    isLoading,
    selectedSymbolDetail,
    symbolType,
    exchangeType,
    watchListOpen,
    setWatchListOpen,
  } = useSymbolContext()
  const { userData, openOrdersUC, setOpenOrdersUC, delOpenOrders, activeExchange } = useContext(UserContext)
  const [fecthingIntervals, setFetchingIntervals] = useState(true)
  const [intervals, setIntervals] = useState([])
  const [lsValue] = useLocalStorage('tradingview.IntervalWidget.quicks')
  const [reRender, setReRender] = useState(new Date().getTime())
  const [exchangeName, seExchangeName] = useState(null)
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
    if (docVisibility && isChartReady && activeExchange.exchange === "binance" && (new Date().getTime() - savedTime) > 30000) {
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
    if (!activeExchange?.exchange || exchangeName === activeExchange.exchange) return
    // localStorage.setItem('selectedExchange', activeExchange.exchange)
    seExchangeName(activeExchange.exchange)
    if (count > 0) {
      console.log('Re-rendered')
      setReRender(new Date().getTime())
    }
    setCount(prev => prev + 1)
  }, [activeExchange])

  const onSniperBtnClick = (e) => {
    setWatchListOpen(watchListOpen => !watchListOpen)
  }

  if (!symbolType || !exchangeType) return null // || !Object.keys(symbolDetails).length

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
      sniperBtnClicked={(e) => { onSniperBtnClick(e) }}
      chartReady={(e) => { setIsChartReady(e) }}
    />
  )
}

export default TradeChart
