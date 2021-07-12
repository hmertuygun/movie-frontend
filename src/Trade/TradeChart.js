import React, { useContext, useEffect, useState } from 'react'
import { useSymbolContext } from './context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import { ThemeContext } from '../contexts/ThemeContext'
import TradingViewChart from './components/TradingViewChart/TradingViewChart'
import { useLocalStorage } from '@rehooks/local-storage'
import { saveChartIntervals, saveTimeZone } from '../api/api'
import firebase from 'firebase'

const TradeChart = () => {
  const {
    symbolDetails,
    symbolType,
    exchangeType,
    setWatchListOpen,
    chartData,
  } = useSymbolContext()
  const db = firebase.firestore()
  const { theme } = useContext(ThemeContext)

  const { userData, openOrdersUC, activeExchange } = useContext(UserContext)
  const [lsIntervalValue] = useLocalStorage('tradingview.IntervalWidget.quicks')
  const [lsTimeZoneValue] = useLocalStorage('tradingview.chartproperties')
  const [reRender, setReRender] = useState(new Date().getTime())
  const [exchangeName, seExchangeName] = useState(null)
  const [count, setCount] = useState(0)
  const [docVisibility, setDocVisibility] = useState(true)
  const [isChartReady, setIsChartReady] = useState(false)
  const [drawings, setDrawings] = useState()
  const [templateDrawings, setTemplateDrawings] = useState()
  const [templateDrawingsOpen, setTemplateDrawingsOpen] = useState(false)

  const reconnectWSOnWindowFocus = () => {
    document.addEventListener('visibilitychange', () => {
      setDocVisibility(document.visibilityState === 'visible' ? true : false)
    })
  }

  useEffect(() => {
    reconnectWSOnWindowFocus()
  }, [])

  useEffect(() => {
    if (!count) return
    if (
      docVisibility &&
      isChartReady &&
      activeExchange.exchange === 'binance' &&
      localStorage.getItem('WS') === '0'
    ) {
      setReRender(new Date().getTime())
    }
  }, [activeExchange.exchange, count, docVisibility, isChartReady])

  useEffect(() => {
    setIsChartReady(false)
  }, [reRender])

  useEffect(() => {
    db.collection('template_drawings').onSnapshot((snapshot) => {
      setTemplateDrawings(snapshot.docs[0].data())
    })
  }, [db])

  useEffect(() => {
    db.collection('chart_drawings')
      .doc(userData.email)
      .onSnapshot((snapshot) => {
        setDrawings(snapshot.data().drawings[userData.email])
      })
  }, [db])

  useEffect(() => {
    if (lsIntervalValue && lsIntervalValue.length)
      saveChartIntervals(lsIntervalValue)
  }, [lsIntervalValue])

  useEffect(() => {
    if (
      lsTimeZoneValue?.timezone &&
      lsTimeZoneValue?.timezone !== chartData?.timeZone &&
      count > 0
    ) {
      saveTimeZone(
        lsTimeZoneValue?.timezone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone
      )
    }
  }, [chartData?.timeZone, count, lsTimeZoneValue])

  useEffect(() => {
    if (!activeExchange?.exchange || exchangeName === activeExchange.exchange)
      return
    seExchangeName(activeExchange.exchange)
    if (count > 0) {
      console.log('Re-rendered')
      setReRender(new Date().getTime())
    }
    setCount((prev) => prev + 1)
  }, [activeExchange, count, exchangeName])

  const onSniperBtnClick = () => {
    setWatchListOpen((watchListOpen) => !watchListOpen)
  }

  const onDrawingsBtnClick = (e) => {
    setTemplateDrawingsOpen((templateDrawingsOpen) => !templateDrawingsOpen)
  }

  const filterOrders = (order, symbol) => {
    if (!order?.length || !symbol) return []
    return order.filter((item) => item.symbol.replace('-', '/') === symbol)
  }

  const getSymbolsLS = localStorage.getItem('symbolsKeyValue')
  const symbolDetailsKeyValue = getSymbolsLS
    ? JSON.parse(getSymbolsLS)
    : symbolDetails
  let showChart =
    chartData &&
    symbolType &&
    exchangeType &&
    (getSymbolsLS || Object.keys(symbolDetails).length)
  const { intervals } = chartData || {}

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
          templateDrawings={templateDrawings}
          templateDrawingsOpen={templateDrawingsOpen}
          openOrders={filterOrders(openOrdersUC, symbolType)}
          key={reRender}
          symbol={symbolType}
          exchange={exchangeType}
          marketSymbols={symbolDetailsKeyValue}
          timeZone={chartData?.timeZone}
          sniperBtnClicked={(e) => {
            onSniperBtnClick(e)
          }}
          drawingsBtnClicked={(e) => {
            onDrawingsBtnClick(e)
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
