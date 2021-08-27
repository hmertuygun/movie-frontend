import React, { createContext, useEffect, useState, useContext } from 'react'
import { backOff } from 'exponential-backoff'
import ReconnectingWebSocket from 'reconnecting-websocket'
import * as Sentry from '@sentry/browser'

import {
  getExchanges,
  getBalance,
  getLastPrice,
  getUserExchanges,
  getAllChartData,
  updateLastSelectedAPIKey,
  get24hrTickerPrice,
  getLastSelectedMarketSymbol,
  saveLastSelectedMarketSymbol,
} from '../../api/api'
import { UserContext } from '../../contexts/UserContext'
import { errorNotification } from '../../components/Notifications'
import ccxt from 'ccxt'
export const SymbolContext = createContext()

const SymbolContextProvider = ({ children }) => {
  const {
    activeExchange,
    setActiveExchange,
    totalExchanges,
    loaderVisible,
    setLoaderVisibility,
    setOpenOrdersUC,
    userData,
    lastSelectedSymbol,
    loadApiKeys,
    isOnboardingSkipped,
  } = useContext(UserContext)
  const DEFAULT_SYMBOL_LOAD_SLASH = 'BTC/USDT'
  const DEFAULT_SYMBOL_LOAD_DASH = 'BTC-USDT'
  const DEFAULT_EXCHANGE = 'BINANCE'
  const [disableOrderHistoryRefreshBtn, setDisableOrderHistoryRefreshBtn] =
    useState(false)
  const [disableOpenOrdersRefreshBtn, setDisableOpenOrdesrRefreshBtn] =
    useState(false)
  const [disablePortfolioRefreshBtn, setDisablePortfolioRefreshBtn] =
    useState(false)
  const [disablePositionRefreshBtn, setDisablePositionRefreshBtn] =
    useState(false)
  const [exchanges, setExchanges] = useState([])
  const [symbols, setSymbols] = useState([])
  const [symbolDetails, setSymbolDetails] = useState({})
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [selectedSymbolDetail, setSelectedSymbolDetail] = useState({})
  const [selectedExchange, setSelectedExchange] = useState('')
  const [selectedSymbolBalance, setSelectedSymbolBalance] = useState('')
  const [selectedBaseSymbolBalance, setSelectedBaseSymbolBalance] = useState('')
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [selectedSymbolLastPrice, setSelectedSymbolLastPrice] = useState('')
  const [isLoadingLastPrice, setIsLoadingLastPrice] = useState(false)
  const [isOrderPlaced, setIsOrderPlaced] = useState(false)
  const [isOrderCancelled, setIsOrderCancelled] = useState(false)
  const [lastMessage, setLastMessage] = useState([])
  const [socketLiveUpdate, setSocketLiveUpdate] = useState(true)
  const [pollingLiveUpdate, setPollingLiveUpdate] = useState(true)
  const [timer, setTimer] = useState(null)
  const [exchangeType, setExchangeType] = useState(null)
  const [symbolType, setSymbolType] = useState(null)
  const [baseAsset, setBaseAsset] = useState('')
  const [qouteAsset, setQuoteAsset] = useState('')
  const [binanceDD, setBinanceDD] = useState([])
  const [ftxDD, setFtxDD] = useState([])
  const [binanceUSDD, setBinanceUSDD] = useState([])
  const [isLoadingExchanges, setIsLoadingExchanges] = useState(true)
  const [watchListOpen, setWatchListOpen] = useState(false)
  const [templateDrawings, setTemplateDrawings] = useState(false)
  const [templateDrawingsOpen, setTemplateDrawingsOpen] = useState(false)
  const [chartData, setChartData] = useState(null)
  const orderHistoryTimeInterval = 10000
  const openOrdersTimeInterval = 5000
  const portfolioTimeInterval = 20000
  const positionTimeInterval = 20000
  let disableBtnInterval = null

  useEffect(() => {
    checkDisableBtnStatus()
  }, [])

  useEffect(() => {
    const exchange =
      templateDrawingsOpen && watchListOpen
        ? 'binance'
        : activeExchange.exchange

    let socketURL = ''
    switch (exchange) {
      case 'binance':
        socketURL = 'wss://stream.binance.com:9443/stream'
        break
      case 'binanceus':
        socketURL = 'wss://stream.binance.us:9443/stream'
        break
      case 'ftx':
        socketURL = 'wss://ftx.com/ws/'
        break

      default:
        break
    }
    if (!socketURL) return
    const rws = new ReconnectingWebSocket(socketURL)
    rws.addEventListener('open', () => {
      setLastMessage([])
      switch (exchange) {
        case 'binance':
          setSocketLiveUpdate(true)
          rws.send(
            JSON.stringify({
              id: 1,
              method: 'SUBSCRIBE',
              params: ['!ticker@arr'],
            })
          )
          break
        case 'binanceus':
          setSocketLiveUpdate(true)
          rws.send(
            JSON.stringify({
              id: 1,
              method: 'SUBSCRIBE',
              params: ['!ticker@arr'],
            })
          )
          break

        case 'ftx':
          setSocketLiveUpdate(false)
          break

        default:
          break
      }
    })

    const onBinanceMessage = (lastMessage) => {
      if (lastMessage && 'data' in JSON.parse(lastMessage.data)) {
        const marketData = JSON.parse(lastMessage.data).data.map((item) => {
          return {
            symbol: item.s,
            lastPrice: item.c,
            priceChange: item.p,
            priceChangePercent: item.P,
            highPrice: item.h,
            lowPrice: item.l,
            volume: item.v,
            quoteVolume: item.q,
          }
        })
        setLastMessage(marketData)
      }
    }

    rws.addEventListener('message', (lastMessage) => {
      switch (exchange) {
        case 'binance':
          onBinanceMessage(lastMessage)
          break
        case 'binanceus':
          onBinanceMessage(lastMessage)
          break

        default:
          break
      }
    })

    rws.addEventListener('error', (error) => {
      setSocketLiveUpdate(false)
      rws.close()
      Sentry.captureException(error)
    })

    return () => {
      setTimer(null)
      rws.close()
      rws.removeEventListener('open')
      rws.removeEventListener('message')
    }
  }, [activeExchange, templateDrawingsOpen, watchListOpen])

  useEffect(() => {
    const exchange =
      templateDrawingsOpen && watchListOpen
        ? 'binance'
        : activeExchange.exchange
    if (!socketLiveUpdate) {
      if (timer) clearInterval(timer)
      switch (exchange) {
        case 'binance':
          {
            const getFirstData = async () => {
              const data = await get24hrTickerPrice('binance')
              setLastMessage(data)
            }
            getFirstData()
            setTimer(
              setInterval(async () => {
                try {
                  getFirstData()
                  setPollingLiveUpdate(true)
                } catch (error) {
                  setPollingLiveUpdate(false)
                  Sentry.captureException(error)
                }
              }, 5000)
            )
          }
          break
        case 'binanceus':
          {
            const getFirstData = async () => {
              const data = await get24hrTickerPrice('binanceus')
              setLastMessage(data)
            }
            getFirstData()
            setTimer(
              setInterval(async () => {
                try {
                  getFirstData()
                  setPollingLiveUpdate(true)
                } catch (error) {
                  setPollingLiveUpdate(false)
                  Sentry.captureException(error)
                }
              }, 5000)
            )
          }
          break
        case 'ftx':
          {
            const fetchTickers = async () => {
              try {
                const ftx = new ccxt.ftx({
                  proxy: 'https://nodejs-cors.herokuapp.com/',
                })
                const response = await ftx.fetchTickers()
                return response
              } catch (error) {
                console.log(error)
              }
            }
            const getFirstData = async () => {
              const response = await fetchTickers()
              if (!response) return
              const message = Object.values(response).map((item) => {
                return {
                  symbol: item.symbol,
                  lastPrice: item.last,
                  priceChange: item.change,
                  priceChangePercent: item.percentage,
                  highPrice: item.high,
                  lowPrice: item.low,
                  volume: item.baseVolume,
                  quoteVolume: item.quoteVolume,
                }
              })
              setLastMessage(message)
            }

            getFirstData()
            setTimer(
              setInterval(async () => {
                try {
                  getFirstData()
                  setPollingLiveUpdate(true)
                } catch (error) {
                  setPollingLiveUpdate(false)
                  Sentry.captureException(error)
                }
              }, 5000)
            )
          }
          break

        default:
          break
      }
    } else {
      if (timer) clearInterval(timer)
    }
    return () => {
      clearInterval(timer)
    }
  }, [socketLiveUpdate, activeExchange, templateDrawingsOpen, watchListOpen])

  useEffect(() => {
    let { exchange } = activeExchange
    if (
      !exchange ||
      !selectedSymbol?.label ||
      !Object.keys(symbolDetails).length
    )
      return
    localStorage.setItem('selectedExchange', exchange)
    exchange = exchange.toUpperCase()
    setOpenOrdersUC(null)
    const key = `${exchange}:${selectedSymbol.label.replace('-', '/')}`
    const details = symbolDetails[key]
    if (details) {
      setSymbol({ label: selectedSymbol.label, value: key })
      setSelectedSymbolDetail(details)
    } else {
      const val = `${exchange}:${DEFAULT_SYMBOL_LOAD_SLASH}`
      setSymbol({ label: DEFAULT_SYMBOL_LOAD_DASH, value: val })
      setSelectedSymbolDetail(symbolDetails[val])
    }
  }, [activeExchange])

  useEffect(() => {
    if (!selectedSymbol || !Object.keys(symbolDetails).length) return
    const [baseAsset, qouteAsset] = selectedSymbol.label.split('-')
    //loadBalance(qouteAsset, baseAsset)
    loadLastPrice(selectedSymbol.label.replace('-', '/'))
  }, [selectedSymbol])

  useEffect(() => {
    if (!symbolType || !activeExchange?.exchange) return
    const [baseAsset, qouteAsset] = symbolType.split('/')
    setBaseAsset(baseAsset)
    setQuoteAsset(qouteAsset)
    loadBalance(qouteAsset, baseAsset)
  }, [activeExchange, symbolType])

  useEffect(() => {
    setExchangesFromTotalExchanges()
  }, [totalExchanges])

  // On mounted, make sure userData has been filled to avoid any FB token errors
  useEffect(() => {
    if (!userData) return
    getChartDataOnInit()
  }, [userData, activeExchange, watchListOpen, templateDrawingsOpen])

  const checkDisableBtnStatus = () => {
    disableBtnInterval = setInterval(() => {
      const orderHistoryLS = localStorage.getItem('orderHistoryRefreshBtn')
      const openOrdersLS = localStorage.getItem('openOrdersRefreshBtn')
      const portfolioLS = localStorage.getItem('portfolioRefreshBtn')
      const positionLS = localStorage.getItem('positionRefreshBtn')

      if (
        orderHistoryLS &&
        Date.now() - orderHistoryLS < orderHistoryTimeInterval
      )
        setDisableOrderHistoryRefreshBtn(true)
      else setDisableOrderHistoryRefreshBtn(false)

      if (openOrdersLS && Date.now() - openOrdersLS < openOrdersTimeInterval)
        setDisableOpenOrdesrRefreshBtn(true)
      else setDisableOpenOrdesrRefreshBtn(false)

      if (portfolioLS && Date.now() - portfolioLS < portfolioTimeInterval)
        setDisablePortfolioRefreshBtn(true)
      else setDisablePortfolioRefreshBtn(false)

      if (positionLS && Date.now() - positionLS < positionTimeInterval)
        setDisablePositionRefreshBtn(true)
      else setDisablePositionRefreshBtn(false)
    }, 1000)
  }

  const onRefreshBtnClicked = (type) => {
    const dateNow = Date.now()
    if (type === 'order-history') {
      setDisableOrderHistoryRefreshBtn(true)
      localStorage.setItem('orderHistoryRefreshBtn', dateNow)
    } else if (type === 'open-order') {
      setDisableOpenOrdesrRefreshBtn(true)
      localStorage.setItem('openOrdersRefreshBtn', dateNow)
    } else if (type === 'portfolio') {
      setDisablePortfolioRefreshBtn(true)
      localStorage.setItem('portfolioRefreshBtn', dateNow)
    } else if (type === 'position') {
      setDisablePositionRefreshBtn(true)
      localStorage.setItem('positionRefreshBtn', dateNow)
    }
  }

  const getChartDataOnInit = async () => {
    // get chart data, like last selected symbols, fav chart intervals & drawings
    // get market symbols
    try {
      const exchange =
        templateDrawingsOpen && watchListOpen
          ? 'binance'
          : activeExchange.exchange
      const { data } = await getAllChartData()
      let { drawings, intervals, watchlist, lastSelectedSymbol, timeZone } =
        data
      drawings = drawings && drawings[userData?.email]
      lastSelectedSymbol =
        lastSelectedSymbol || `${DEFAULT_EXCHANGE}:${DEFAULT_SYMBOL_LOAD_SLASH}`
      intervals = intervals || []
      setChartData({
        drawings,
        lastSelectedSymbol,
        intervals,
        timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      let [exchangeVal, symbolVal] = lastSelectedSymbol.split(':')
      exchangeVal = exchange || exchangeVal.toLowerCase() || DEFAULT_EXCHANGE
      symbolVal = symbolVal || DEFAULT_SYMBOL_LOAD_SLASH
      localStorage.setItem('selectedExchange', exchangeVal)
      localStorage.setItem('selectedSymbol', symbolVal)
      const [baseAsset, qouteAsset] = symbolVal.split('/')
      setSelectedSymbolDetail({
        base_asset: baseAsset,
        quote_asset: qouteAsset,
      }) // to show balance in trade panel quickly
      setSymbolType(symbolVal)
      setExchangeType(exchangeVal.toLowerCase())
      loadExchanges(symbolVal, exchangeVal)
      setSelectedSymbol({
        label: symbolVal.replace('/', '-'),
        value: `${exchangeVal.toUpperCase()}:${symbolType}`,
      })
      loadLastPrice(symbolVal, exchangeVal)
    } catch (e) {
      console.error(e)
    } finally {
    }
  }

  const loadBalance = async (quote_asset, base_asset) => {
    try {
      // solves an issue where you get incorrect symbol balance by clicking on diff symbols rapidly
      const getSymbolFromLS = localStorage.getItem('selectedSymbol')
      if (
        !activeExchange?.exchange ||
        !quote_asset ||
        (!base_asset &&
          getSymbolFromLS &&
          `${base_asset}/${quote_asset}` !== getSymbolFromLS)
      )
        return
      setIsLoadingBalance(true)
      if (!isOnboardingSkipped) {
        const quoteBalance = await getBalance({
          symbol: quote_asset,
          ...activeExchange,
        })
        if (quoteBalance?.data?.balance)
          setSelectedSymbolBalance(quoteBalance.data.balance)
        else setSelectedSymbolBalance(0)

        const baseBalance = await getBalance({
          symbol: base_asset,
          ...activeExchange,
        })
        if (baseBalance?.data?.balance)
          setSelectedBaseSymbolBalance(baseBalance.data.balance)
        else setSelectedBaseSymbolBalance(0)
      }
    } catch (err) {
      console.error(err)
      setSelectedSymbolBalance(0)
      setSelectedBaseSymbolBalance(0)
    } finally {
      setIsLoadingBalance(false)
    }
  }

  const loadLastPrice = async (symbolpair, exchangeParam) => {
    try {
      setIsLoadingLastPrice(true)
      // setSelectedSymbolLastPrice(0)
      const response = await backOff(
        () =>
          getLastPrice(symbolpair, exchangeParam || activeExchange?.exchange),
        { jitter: 'full', numOfAttempts: 3, timeMultiple: 10 }
      )
      if (response?.data?.last_price !== 'NA')
        setSelectedSymbolLastPrice(response.data.last_price)
      else setSelectedSymbolLastPrice(0)
    } catch (err) {
      console.error(err)
      errorNotification.open({
        description: `Error getting last price of market.`,
        key: 'last-price-warning',
      })
      setSelectedSymbolLastPrice(0)
    } finally {
      setIsLoadingLastPrice(false)
    }
  }

  const setSymbol = async (symbol) => {
    if (!symbol || symbol?.value === selectedSymbol?.value) return
    const symbolT = symbol.label.replace('-', '/')
    localStorage.setItem('selectedSymbol', symbolT)
    setSymbolType(symbolT)
    setSelectedSymbolDetail(symbolDetails[symbol.value])
    setSelectedSymbol(symbol)
    try {
      await saveLastSelectedMarketSymbol(symbol.value)
    } catch (e) {
      console.log(e)
    }
  }

  const setExchange = async (exchange) => {
    try {
      // if user selects the selected option again in the dropdown
      if (
        activeExchange.apiKeyName === exchange.apiKeyName &&
        activeExchange.exchange === exchange.exchange
      ) {
        return
      }
      setLoaderVisibility(true)
      await updateLastSelectedAPIKey({ ...exchange })
      setActiveExchange(exchange)
      sessionStorage.setItem('exchangeKey', JSON.stringify(exchange))
    } catch (e) {
      errorNotification.open({
        description: `Error activating this exchange key!`,
      })
    } finally {
    }
  }

  const loadExchanges = async (symbol, exchange) => {
    try {
      //if (!userData) return
      setIsLoadingExchanges(true)
      const data = await getExchanges()
      if (!data?.exchanges?.length || !data?.symbolsChange) {
        return
      }
      const [binance, ftx, binanceus] = data.exchanges
      setSymbols(() => [
        ...binance.symbols,
        ...ftx.symbols,
        ...binanceus.symbols,
      ])
      setSymbolDetails(data.symbolsChange)
      localStorage.setItem(
        'symbolsKeyValue',
        JSON.stringify(data.symbolsChange)
      )
      setBinanceDD(() => binance.symbols)
      setFtxDD(() => ftx.symbols)
      setBinanceUSDD(() => binanceus.symbols)
      const val = `${exchange.toUpperCase()}:${symbol}`
      setSelectedSymbolDetail(data.symbolsChange[val])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoadingExchanges(false)
    }
  }

  const refreshBalance = async () => {
    setIsLoadingBalance(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    if (selectedSymbolDetail?.quote_asset) {
      loadBalance(
        selectedSymbolDetail.quote_asset,
        selectedSymbolDetail.base_asset
      )
    }
  }

  const setExchangesFromTotalExchanges = () => {
    if (!totalExchanges || !totalExchanges.length) return
    let mapExchanges = totalExchanges.map((item) => ({
      ...item,
      label: `${item.exchange} - ${item.apiKeyName}`,
      value: `${item.exchange} - ${item.apiKeyName}`,
    }))
    setExchanges(mapExchanges)
  }

  const refreshExchanges = async () => {
    try {
      const response = await getUserExchanges()
      if (response?.data?.error) return
      const apiKeys = response.data.apiKeys.map((item) => {
        return {
          ...item,
          label: `${item.exchange} - ${item.apiKeyName}`,
          value: `${item.exchange} - ${item.apiKeyName}`,
        }
      })
      setExchanges(apiKeys)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <SymbolContext.Provider
      value={{
        isLoading: !selectedSymbolDetail || isLoadingExchanges,
        exchanges,
        disableOrderHistoryRefreshBtn,
        disableOpenOrdersRefreshBtn,
        disablePortfolioRefreshBtn,
        disablePositionRefreshBtn,
        orderHistoryTimeInterval,
        openOrdersTimeInterval,
        positionTimeInterval,
        portfolioTimeInterval,
        onRefreshBtnClicked,
        refreshExchanges,
        setExchange,
        symbols,
        setSymbol,
        selectedSymbol,
        symbolDetails,
        selectedSymbolDetail,
        selectedSymbolBalance,
        selectedBaseSymbolBalance,
        isLoadingBalance,
        isLoadingLastPrice,
        selectedSymbolLastPrice,
        setSelectedSymbolLastPrice,
        refreshBalance,
        isOrderPlaced,
        setIsOrderPlaced,
        isOrderCancelled,
        setIsOrderCancelled,
        lastMessage,
        liveUpdate: socketLiveUpdate || pollingLiveUpdate,
        exchangeType,
        symbolType,
        binanceDD,
        binanceUSDD,
        ftxDD,
        watchListOpen,
        setWatchListOpen,
        templateDrawings,
        setTemplateDrawings,
        templateDrawingsOpen,
        setTemplateDrawingsOpen,
        chartData,
      }}
    >
      {children}
    </SymbolContext.Provider>
  )
}

export const useSymbolContext = () => {
  return useContext(SymbolContext)
}

export default SymbolContextProvider
