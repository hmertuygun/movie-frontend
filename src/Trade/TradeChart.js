import React, { useContext, useEffect, useState } from 'react'
import { useSymbolContext } from './context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import { ThemeContext } from '../contexts/ThemeContext'
import TradingViewChart from './components/TradingViewChart/TradingViewChart'
import TraderModal from './components/TradersModal/TradersModal'
import { useLocalStorage } from '@rehooks/local-storage'
import { saveChartIntervals, saveTimeZone } from '../api/api'
import { firebase } from '../firebase/firebase'
import { TEMPLATE_DRAWINGS_USERS } from '../constants/TemplateDrawingsList'
import { exception } from 'react-ga'
import { exchanges } from 'ccxt'

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
    setSymbol,
    kucoinDD,
    binanceDD,
    binanceUSDD,
    isTradersModalOpen,
    setIsTradersModalOpen,
    activeTrader,
    setActiveTrader,
    selectedSymbol,
  } = useSymbolContext()
  const db = firebase.firestore()
  const { theme } = useContext(ThemeContext)
  const { userData, openOrdersUC, isOnboardingSkipped, activeExchange } =
    useContext(UserContext)
  const [lsIntervalValue] = useLocalStorage('tradingview.IntervalWidget.quicks')
  const [lsTimeZoneValue] = useLocalStorage('tradingview.chartproperties')
  const [drawings, setDrawings] = useState()
  const [allTemplateDrawings, setAllTemplateDrawings] = useState([])
  const [defaultTrader, setDefaultTrader] = useState([])
  const [exchange, setExchange] = useState(exchangeType)
  const [onError, setOnError] = useState(false)

  useEffect(() => {
    if (typeof localStorage.getItem('chartMirroring') === 'string') {
      const status =
        localStorage.getItem('chartMirroring') === 'true' ? true : false
      setTemplateDrawingsOpen(status)
    }
    console.log('TV Parent loaded', exchangeType, symbolType)
  }, [])

  useEffect(() => {
    if (!TEMPLATE_DRAWINGS_USERS.includes(userData.email)) {
      db.collection('template_drawings').onSnapshot(
        (snapshot) => {
          const allTradersData = snapshot.docs.map((trader) => {
            return { ...trader.data(), id: trader.id }
          })
          if (activeTrader?.id) {
            const initTemplate = allTradersData.find(
              (trader) => activeTrader.id === trader.id
            )
            setActiveTrader(initTemplate)
          } else {
            db.collection('chart_drawings')
              .doc(userData.email)
              .get()
              .then((snapshotUser) => {
                if (snapshotUser.data()?.activeTrader) {
                  const init = allTradersData.find(
                    (trader) => snapshotUser.data().activeTrader === trader.id
                  )
                  setActiveTrader(init)
                }
              })
          }
          setAllTemplateDrawings(allTradersData)
        },
        (error) => {
          console.error(error)
          setOnError(true)
        }
      )
    }
  }, [db, userData])

  useEffect(() => {
    if (selectedSymbol.value) {
      localStorage.setItem(
        'selectedExchange',
        selectedSymbol.value.split(':')[0].toLowerCase()
      )
      setExchange(selectedSymbol.value.split(':')[0].toLowerCase())
    } else {
      setExchange(exchangeType)
    }
  }, [selectedSymbol])

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
        const mainSelectedSymbol = JSON.parse(
          localStorage.getItem('mainSelectedSymbol')
        )

        setSymbol(mainSelectedSymbol)
      } else {
        localStorage.setItem(
          'mainSelectedSymbol',
          JSON.stringify(selectedSymbol)
        )
      }
      return !watchListOpen
    })
  }

  const onTradersBtnClick = () => {
    setIsTradersModalOpen((isTradersModalOpen) => !isTradersModalOpen)
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

  const isLoadChart = () => {
    return exchange && symbolType
  }

  const getSymbolsLS = localStorage.getItem('symbolsKeyValue')
  const symbolDetailsKeyValue = getSymbolsLS
    ? JSON.parse(getSymbolsLS)
    : symbolDetails
  const { intervals } = chartData || {}

  return (
    <div
      id="chart_outer_container"
      className="d-flex justify-content-center align-items-center"
      style={{ width: '100%', height: '100%' }}
    >
      {isLoadChart() ? (
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
          key={`${exchangeType}`}
          symbol={symbolType}
          exchange={exchange}
          marketSymbols={symbolDetailsKeyValue}
          timeZone={chartData?.timeZone}
          activeTrader={activeTrader}
          sniperBtnClicked={(e) => {
            onSniperBtnClick(e)
          }}
          drawingsBtnClicked={(e) => {
            onDrawingsBtnClick(e)
          }}
          tradersBtnClicked={(e) => {
            onTradersBtnClick(e)
          }}
        />
      ) : (
        <span className="spinner-border spinner-border-sm text-primary" />
      )}
    </div>
  )
}

export default TradeChart
