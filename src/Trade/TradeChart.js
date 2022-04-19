import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useSymbolContext } from './context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import { ThemeContext } from '../contexts/ThemeContext'
import TradingViewChart from './components/TradingViewChart/TradingViewChart'
import { useLocalStorage } from '@rehooks/local-storage'
import { saveChartIntervals, saveTimeZone } from '../api/api'
import { firebase } from '../firebase/firebase'
import {
  getSnapShotCollection,
  getSnapShotDocument,
} from '../api/firestoreCall'
import lzutf8 from 'lzutf8'

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
    selectEmojiPopoverOpen,
    setActiveAnalysts,
  } = useSymbolContext()
  const db = firebase.firestore()
  const { theme } = useContext(ThemeContext)
  const history = useHistory()
  const {
    userData,
    openOrdersUC,
    isOnboardingSkipped,
    activeExchange,
    setChartDrawings,
    chartDrawings,
    settingChartDrawings,
    allAnalysts,
    setActiveDrawingId,
    setActiveDrawing,
    addedDrawing,
    isAnalyst,
  } = useContext(UserContext)
  const [lsIntervalValue] = useLocalStorage('tradingview.IntervalWidget.quicks')
  const [lsTimeZoneValue] = useLocalStorage('tradingview.chartproperties')
  const [drawings, setDrawings] = useState()
  const [allTemplateDrawings, setAllTemplateDrawings] = useState([])
  const [defaultTrader, setDefaultTrader] = useState([])
  const [exchange, setExchange] = useState(exchangeType)
  const [onError, setOnError] = useState(false)
  const [onMarket, setOnMarket] = useState(false)

  useEffect(() => {
    if (typeof localStorage.getItem('chartMirroring') === 'string') {
      const status =
        localStorage.getItem('chartMirroring') === 'true' ? true : false
      setTemplateDrawingsOpen(status)
    }
    setOnMarket(history.location.pathname === '/market')
    console.log('TV Parent loaded', exchangeType, symbolType)

    window.onbeforeunload = function (e) {
      var dialogText =
        'You may have unsaved changes. Are you sure you want to leave?'
      e.returnValue = dialogText
      return dialogText
    }

    return () => {
      window.onbeforeunload = null
    }
  }, [])

  useEffect(() => {
    if (!isAnalyst) setActiveAnalysts()
  }, [isAnalyst])

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
    getSnapShotCollection('chart_shared').onSnapshot(
      (snapshot) => {
        if (snapshot?.docs[0]) {
          let { drawings } = snapshot.docs[0].data()
          try {
            drawings = lzutf8.decompress(drawings, { inputEncoding: 'Base64' })
          } catch (error) {
            console.log('old')
          } finally {
            setTemplateDrawings({ drawings })
          }
        }
      },
      (error) => {
        console.log(error)
        setOnError(true)
      }
    )
  }, [db])

  useEffect(() => {
    const unsubscribe = getSnapShotDocument(
      'chart_drawings',
      userData.email
    ).onSnapshot(
      (snapshot) => {
        if (snapshot.data()?.drawings?.[userData.email]) {
          let converted = ''
          try {
            converted = snapshot.data()?.drawings?.[userData.email]
            const check = JSON.parse(
              snapshot.data()?.drawings?.[userData.email]
            )
            console.log('old')
          } catch (error) {
            converted = lzutf8.decompress(
              snapshot.data()?.drawings?.[userData.email],
              { inputEncoding: 'Base64' }
            )
          } finally {
            setDrawings(converted)
            setChartDrawings(converted)
          }
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
        console.log(error)
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

  const createBackup = (drawing) => {
    console.log('execute backup function')
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

  const isLoadChart = useMemo(() => {
    return exchangeType && symbolType
  }, [exchangeType, symbolType])

  const getSymbolsLS = useMemo(
    () => localStorage.getItem('symbolsKeyValue'),
    [localStorage.getItem('symbolsKeyValue')]
  )
  const symbolDetailsKeyValue = useMemo(
    () => (getSymbolsLS ? JSON.parse(getSymbolsLS) : symbolDetails),
    [getSymbolsLS, symbolDetails]
  )

  const { intervals } = useMemo(() => chartData || {}, [chartData])

  return (
    <div
      id="chart_outer_container"
      className="d-flex justify-content-center align-items-center"
      style={{ width: '100%', height: '100%' }}
    >
      {isLoadChart ? (
        <>
          <TradingViewChart
            email={userData?.email}
            theme={theme}
            intervals={intervals}
            drawings={chartDrawings}
            settingChartDrawings={settingChartDrawings}
            onMarketPage={onMarket}
            watchListOpen={watchListOpen}
            templateDrawings={templateDrawings}
            templateDrawingsOpen={templateDrawingsOpen}
            onError={onError}
            openOrders={filterOrders(openOrdersUC, symbolType)}
            key={`${exchangeType}`}
            symbol={symbolType}
            exchange={exchange}
            addedDrawing={addedDrawing}
            marketSymbols={symbolDetailsKeyValue}
            timeZone={chartData?.timeZone}
            activeTrader={activeTrader}
            createBackup={createBackup}
            setActiveDrawing={(e) => {
              setActiveDrawing(e)
            }}
            setActiveDrawingId={(e) => {
              console.log(e)
              setActiveDrawingId(e)
            }}
            sniperBtnClicked={(e) => {
              onSniperBtnClick(e)
            }}
            drawingsBtnClicked={(e) => {
              onDrawingsBtnClick(e)
            }}
            tradersBtnClicked={(e) => {
              onTradersBtnClick(e)
            }}
            selectEmojiPopoverOpen={selectEmojiPopoverOpen}
          />
        </>
      ) : (
        <span className="spinner-border spinner-border-sm text-primary" />
      )}
    </div>
  )
}

export default TradeChart
