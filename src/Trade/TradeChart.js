import React, { useContext, useEffect, useState } from 'react'
import { useSymbolContext } from './context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import { ThemeContext } from '../contexts/ThemeContext'
import TradingViewChart from './components/TradingViewChart/TradingViewChart'
import { useLocalStorage } from '@rehooks/local-storage'
import { getChartIntervals, saveChartIntervals } from '../api/api'
const TradeChart = () => {
  const {
    symbolDetails,
    symbolType,
    exchangeType,
    setWatchListOpen,
    chartData
  } = useSymbolContext()
  const { theme } = useContext(ThemeContext);

  const { userData, openOrdersUC, activeExchange } = useContext(UserContext)
  const [lsValue] = useLocalStorage('tradingview.IntervalWidget.quicks')
  const [reRender, setReRender] = useState(new Date().getTime())
  const [exchangeName, seExchangeName] = useState(null)
  const [count, setCount] = useState(0)
  const [docVisibility, setDocVisibility] = useState(true)
  const [isChartReady, setIsChartReady] = useState(false)
  const [drawingShown, setDrawingShown] = useState(false)

  const reconnectWSOnWindowFocus = () => {
    document.addEventListener('visibilitychange', (ev) => {
      setDocVisibility(document.visibilityState === "visible" ? true : false)
    })
  }

  useEffect(() => {
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

  const getSymbolsLS = localStorage.getItem('symbolsKeyValue')
  const symbolDetailsKeyValue = getSymbolsLS ? JSON.parse(getSymbolsLS) : symbolDetails
  let showChart = chartData && symbolType && exchangeType && (getSymbolsLS || Object.keys(symbolDetails).length)
  const { drawings, intervals } = chartData || {}

  return (
    <div
      id="chart_outer_container"
      className="d-flex justify-content-center align-items-center"
      style={{ width: '100%', height: '100%' }}
    >
      {showChart ? (
        <TradingViewChart
          email={userData?.email}
          theme={theme}
          intervals={intervals}
          drawings={drawings}
          openOrders={openOrdersUC}
          key={reRender}
          symbol={symbolType}
          exchange={exchangeType}
          marketSymbols={symbolDetailsKeyValue}
          sniperBtnClicked={(e) => {
            onSniperBtnClick(e)
          }}
          chartReady={(e) => {
            setIsChartReady(e)
          }}
        />
      ) : (
        <span className="spinner-border spinner-border-sm text-primary" />
      )}
    </div>
  )
}

export default TradeChart
