import React, { useContext, useEffect, useState } from 'react'
import { useSymbolContext } from './context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import { ThemeContext } from '../contexts/ThemeContext'
import TradingViewChart from './components/TradingViewChart/TradingViewChart'
import { useLocalStorage } from '@rehooks/local-storage'
import { saveChartIntervals, saveTimeZone } from '../api/api'
import { firebase } from '../firebase/firebase'

const TradeChart = () => {
  const {
    symbolDetails,
    symbolType,
    exchangeType,
    setWatchListOpen,
    chartData,
    templateDrawings,
    setTemplateDrawings,
    watchListOpen,
    templateDrawingsOpen,
    setTemplateDrawingsOpen,
    selectedSymbol,
    setSymbol,
  } = useSymbolContext()
  const db = firebase.firestore()
  const { theme } = useContext(ThemeContext)

  const { userData, openOrdersUC, isOnboardingSkipped, activeExchange } =
    useContext(UserContext)
  const [lsIntervalValue] = useLocalStorage('tradingview.IntervalWidget.quicks')
  const [lsTimeZoneValue] = useLocalStorage('tradingview.chartproperties')
  const [drawings, setDrawings] = useState()
  const [onError, setOnError] = useState(false)

  useEffect(() => {
    if (typeof localStorage.getItem('chartMirroring') === 'string') {
      const status =
        localStorage.getItem('chartMirroring') === 'true' ? true : false
      setTemplateDrawingsOpen(status)
    }
  }, [])

  useEffect(() => {
    db.collection('template_drawings').onSnapshot(
      (snapshot) => {
        if (snapshot?.docs[0]) {
          setTemplateDrawings(snapshot.docs[0].data())
        }
      },
      (error) => {
        console.error(error)
        setOnError(true)
      }
    )
  }, [db])

  useEffect(() => {
    const unsubscribe = db
      .collection('chart_drawings')
      .doc(userData.email)
      .onSnapshot(
        (snapshot) => {
          if (snapshot.data()?.drawings?.[userData.email]) {
            setDrawings(snapshot.data().drawings[userData.email])
          } else if (
            !snapshot.data()?.drawings &&
            snapshot.data()?.lastSelectedSymbol
          ) {
            setDrawings([])
          } else {
            setOnError(true)
          }
        },
        (error) => {
          console.error(error)
          setOnError(true)
        }
      )
    return () => unsubscribe()
  }, [db, userData])

  useEffect(() => {
    if (lsIntervalValue && lsIntervalValue.length)
      saveChartIntervals(lsIntervalValue)
  }, [lsIntervalValue])

  useEffect(() => {
    if (!isOnboardingSkipped) {
      if (
        lsTimeZoneValue?.timezone &&
        lsTimeZoneValue?.timezone !== chartData?.timeZone
      ) {
        saveTimeZone(
          lsTimeZoneValue?.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone
        )
      }
    }
  }, [chartData?.timeZone, lsTimeZoneValue, isOnboardingSkipped])

  const onSniperBtnClick = () => {
    setWatchListOpen((watchListOpen) => {
      if (watchListOpen) {
        const { exchange } = activeExchange
        if (exchange === exchangeType) return !watchListOpen

        const selectedSymbol = localStorage.getItem('mainSelectedSymbol')
        const label = selectedSymbol.replace('/', '-')
        const value = `${exchange}:${selectedSymbol}`

        setSymbol({ label, value })
      } else {
        const selectedSymbol = localStorage.getItem('selectedSymbol')
        localStorage.setItem('mainSelectedSymbol', selectedSymbol)
      }
      return !watchListOpen
    })
  }

  useEffect(() => {
    const helpButtonElement = document.getElementById('launcher')
    if (!helpButtonElement) return

    if (watchListOpen) {
      helpButtonElement.style.display = 'none'
    } else {
      helpButtonElement.style.display = 'unset'
    }
  }, [watchListOpen])

  const onDrawingsBtnClick = (e) => {
    setTemplateDrawingsOpen((templateDrawingsOpen) => {
      localStorage.setItem('chartMirroring', !templateDrawingsOpen)
      return !templateDrawingsOpen
    })
  }

  const filterOrders = (order, symbol) => {
    if (!order?.length || !symbol) return []
    return order.filter((item) => item.symbol.replace('-', '/') === symbol)
  }

  const getSymbolsLS = localStorage.getItem('symbolsKeyValue')
  const symbolDetailsKeyValue = getSymbolsLS
    ? JSON.parse(getSymbolsLS)
    : symbolDetails

  const showChart =
    chartData &&
    symbolType &&
    exchangeType &&
    selectedSymbol.value &&
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
          watchListOpen={watchListOpen}
          templateDrawings={templateDrawings}
          templateDrawingsOpen={templateDrawingsOpen}
          onError={onError}
          openOrders={filterOrders(openOrdersUC, symbolType)}
          key={`${exchangeType}${selectedSymbol.value}`}
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
        />
      ) : (
        <span className="spinner-border spinner-border-sm text-primary" />
      )}
    </div>
  )
}

export default TradeChart
