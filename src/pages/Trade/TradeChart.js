import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import { useSymbolContext } from 'contexts/SymbolContext'
import { ThemeContext } from 'contexts/ThemeContext'
import TradingViewChart from './components/TradingViewChart/TradingViewChart'
import { useLocalStorage } from '@rehooks/local-storage'
import { saveChartIntervals, saveTimeZone } from 'services/api'
import { firebase } from 'services/firebase'
import { getSnapShotDocument } from 'services/api'
import { storage } from 'services/storages'
import lzutf8 from 'lzutf8'
import { useSelector, useDispatch } from 'react-redux'
import {
  setActiveAnalysts,
  updateActiveDrawing,
  updateActiveDrawingId,
  updateAddedDrawing,
  updateChartDrawings,
  updateIsChartReady,
  updateIsTradersModalOpen,
  updateTemplateDrawingsOpen,
  updateWatchListOpen,
} from 'store/actions'
import { consoleLogger } from 'utils/logger'

const TradeChart = () => {
  const { setSymbol } = useSymbolContext()

  const { symbolDetails, selectedSymbol, symbolType } = useSelector(
    (state) => state.symbols
  )
  const { templateDrawings, templateDrawingsOpen } = useSelector(
    (state) => state.templates
  )
  const { watchListOpen } = useSelector((state) => state.market)
  const { chartData } = useSelector((state) => state.charts)
  const { activeTrader } = useSelector((state) => state.trades)
  const { selectEmojiPopoverOpen } = useSelector((state) => state.emojis)
  const { exchangeType } = useSelector((state) => state.exchanges)
  const dispatch = useDispatch()
  const db = firebase.firestore()
  const { theme } = useContext(ThemeContext)
  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` })
  const history = useHistory()

  const { isOnboardingSkipped } = useSelector((state) => state.appFlow)
  const { userData, isAnalyst } = useSelector((state) => state.users)
  const { openOrdersUC } = useSelector((state) => state.orders)
  const { chartMirroring, addedDrawing, chartDrawings, settingChartDrawings } =
    useSelector((state) => state.charts)

  const [lsIntervalValue] = useLocalStorage('tradingview.IntervalWidget.quicks')
  const [lsTimeZoneValue] = useLocalStorage('tradingview.chartproperties')
  const [drawings, setDrawings] = useState()
  const [exchange, setExchange] = useState(exchangeType)
  const [onError, setOnError] = useState(false)
  const [onMarket, setOnMarket] = useState(false)

  useEffect(() => {
    if (typeof chartMirroring === 'string') {
      const status = chartMirroring === 'true' ? true : false
      dispatch(updateTemplateDrawingsOpen(status))
    }
    setOnMarket(history.location.pathname === '/market')
    consoleLogger('TV Parent loaded', exchangeType, symbolType)
  }, [])

  useEffect(() => {
    if (!isAnalyst) dispatch(setActiveAnalysts(userData))
  }, [isAnalyst])

  useEffect(() => {
    if (selectedSymbol.value) {
      storage.set(
        'selectedExchange',
        selectedSymbol.value.split(':')[0].toLowerCase()
      )
      setExchange(selectedSymbol.value.split(':')[0].toLowerCase())
    } else {
      setExchange(exchangeType)
    }
  }, [selectedSymbol])

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
            consoleLogger('old')
          } catch (error) {
            converted = lzutf8.decompress(
              snapshot.data()?.drawings?.[userData.email],
              { inputEncoding: 'Base64' }
            )
          } finally {
            setDrawings(converted)
            dispatch(updateChartDrawings(converted))
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
        consoleLogger(error)
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
    dispatch(
      updateWatchListOpen((watchListOpen) => {
        if (watchListOpen) {
          const mainSelectedSymbol = JSON.parse(
            storage.get('mainSelectedSymbol')
          )

          setSymbol(mainSelectedSymbol)
        } else {
          storage.set('mainSelectedSymbol', JSON.stringify(selectedSymbol))
        }
        return !watchListOpen
      })
    )
  }

  const createBackup = (drawing) => {
    consoleLogger('execute backup function')
  }

  const onTradersBtnClick = () => {
    dispatch(
      updateIsTradersModalOpen((isTradersModalOpen) => !isTradersModalOpen)
    )
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
    dispatch(
      updateTemplateDrawingsOpen((templateDrawingsOpen) => {
        dispatch(updateTemplateDrawingsOpen(!templateDrawingsOpen))
        return !templateDrawingsOpen
      })
    )
  }

  const filterOrders = (order, symbol) => {
    if (!order?.length || !symbol) return []
    return order.filter((item) => item.symbol.replace('-', '/') === symbol)
  }

  const isLoadChart = useMemo(() => {
    return exchangeType && symbolType
  }, [exchangeType, symbolType])

  const getSymbolsLS = useMemo(
    () => storage.get('symbolsKeyValue'),
    [storage.get('symbolsKeyValue')]
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
            isMobile={isMobile}
            isAnalyst={isAnalyst}
            setAddedDrawing={(e) => {
              if (addedDrawing !== null) dispatch(updateAddedDrawing(e))
            }}
            setActiveDrawing={(e) => {
              dispatch(updateActiveDrawing(e))
            }}
            setActiveDrawingId={(e) => {
              dispatch(updateActiveDrawingId(e))
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
            setIsChartReady={(e) => {
              dispatch(updateIsChartReady(e))
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
