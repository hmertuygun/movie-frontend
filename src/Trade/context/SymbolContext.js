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
import { execExchangeFunc } from '../../helpers/getExchangeProp'
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
  const [kucoinDD, setKucoinDD] = useState([])
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

  const useInterval = (callback, delay) => {
    const savedCallback = React.useRef()

    useEffect(() => {
      savedCallback.current = callback
    }, [callback])

    useEffect(() => {
      function tick() {
        savedCallback.current()
      }
      if (delay !== null) {
        let id = setInterval(tick, delay)
        return () => clearInterval(id)
      }
    }, [delay])
  }

  useInterval(async () => {
    const exchange =
      templateDrawingsOpen && watchListOpen
        ? 'binance'
        : activeExchange.exchange
    if (exchange === 'kucoin') {
      const data = await execExchangeFunc(exchange, 'fetchTickers')
      const tickers = execExchangeFunc(exchange, 'editMessage', data)
      setLastMessage(tickers)
    }
  }, 4000)

  useEffect(() => {
    const exchange =
      templateDrawingsOpen && watchListOpen
        ? 'binance'
        : activeExchange.exchange
    let socketURL = ''
    if (exchange == 'kucoin') {
      const token = localStorage.getItem('kucoinEndpoint')
      if (token) {
        let { endpoint, date } = JSON.parse(token)
        if (endpoint)
          socketURL = `wss://ws-api.kucoin.com/endpoint?token=${endpoint}&[connectId=${Date.now()}]`
      }
    } else if (exchange == 'binance') {
      socketURL = 'wss://stream.binance.com:9443/stream'
    } else if (exchange == 'binanceus') {
      socketURL = 'wss://stream.binance.us:9443/stream'
    }

    if (!socketURL) return

    let label = ''
    if (!selectedSymbol.label) {
      if (localStorage.getItem('selectedSymbol')) {
        label = localStorage.getItem('selectedSymbol').replace('/', '-')
      } else {
        label = DEFAULT_SYMBOL_LOAD_DASH
      }
    } else {
      label = selectedSymbol.label
    }

    const rws = new ReconnectingWebSocket(socketURL)

    rws.addEventListener('open', () => {
      setLastMessage([])
      setSocketLiveUpdate(true)
      const initSubMessage = execExchangeFunc(exchange, 'initSubscribe', {
        label,
      })
      rws.send(initSubMessage)
    })

    rws.addEventListener('message', (lastMessage) => {
      const message = execExchangeFunc(exchange, 'onSocketMessage', {
        lastMessage,
      })
      if (message) setLastMessage(message)
    })

    rws.addEventListener('error', (error) => {
      // setSocketLiveUpdate(false)
      // rws.close()
      Sentry.captureException(error)
    })

    return () => {
      setTimer(null)
      rws.close()
      rws.removeEventListener('open')
      rws.removeEventListener('message')
    }
  }, [activeExchange, templateDrawingsOpen, watchListOpen, selectedSymbol])

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
      let { intervals, lastSelectedSymbol, timeZone } = data

      const chartData = {
        intervals: intervals || [],
        timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        lastSelectedSymbol:
          lastSelectedSymbol ||
          `${DEFAULT_EXCHANGE}:${DEFAULT_SYMBOL_LOAD_SLASH}`,
      }

      if (!watchListOpen) {
        setChartData({ ...chartData })
        let [exchangeVal, symbolVal] = chartData.lastSelectedSymbol.split(':')
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
        loadExchanges(symbolVal, exchangeVal)
        setSelectedSymbol({
          label: symbolVal.replace('/', '-'),
          value: `${exchangeVal.toUpperCase()}:${symbolType}`,
        })
        loadLastPrice(symbolVal, exchangeVal)
      }
      setExchangeType(exchange.toLowerCase())
      localStorage.setItem('selectedExchange', exchange.toLowerCase())
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
    if (!watchListOpen) {
      try {
        await saveLastSelectedMarketSymbol(symbol.value)
      } catch (e) {
        console.log(e)
      }
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

      const [binance, ftx, binanceus, kucoin] = data.exchanges
      setSymbols(() => [
        ...binance.symbols,
        ...ftx.symbols,
        ...binanceus.symbols,
        ...kucoin.symbols,
      ])
      setSymbolDetails(data.symbolsChange)
      localStorage.setItem(
        'symbolsKeyValue',
        JSON.stringify(data.symbolsChange)
      )
      setBinanceDD(() => binance.symbols)
      setFtxDD(() => ftx.symbols)
      setBinanceUSDD(() => binanceus.symbols)
      setKucoinDD(() => kucoin.symbols)
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
        isLoading:
          !selectedSymbolDetail || isLoadingExchanges || isLoadingLastPrice,
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
        kucoinDD,
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
