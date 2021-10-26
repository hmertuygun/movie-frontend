import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from 'react'
import { backOff } from 'exponential-backoff'
import ccxtpro from 'ccxt.pro'

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
  const [binanceDD, setBinanceDD] = useState([])
  const [ftxDD, setFtxDD] = useState([])
  const [kucoinDD, setKucoinDD] = useState([])
  const [binanceUSDD, setBinanceUSDD] = useState([])
  const [isLoadingExchanges, setIsLoadingExchanges] = useState(true)
  const [watchListOpen, setWatchListOpen] = useState(false)
  const [templateDrawings, setTemplateDrawings] = useState(false)
  const [templateDrawingsOpen, setTemplateDrawingsOpen] = useState(false)
  const [chartData, setChartData] = useState(null)
  const [marketData, setMarketData] = useState({})
  const orderHistoryTimeInterval = 10000
  const openOrdersTimeInterval = 5000
  const portfolioTimeInterval = 20000
  const positionTimeInterval = 20000
  const [binance, binanceus, kucoin] = [
    new ccxtpro.binance({
      enableRateLimit: true,
    }),
    new ccxtpro.binanceus({
      enableRateLimit: true,
    }),
    new ccxtpro.kucoin({
      proxy: localStorage.getItem('proxyServer'),
      enableRateLimit: true,
    }),
  ]

  useEffect(() => {
    const interval = setInterval(() => {
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

    return () => {
      clearInterval(interval)
    }
  }, [])

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

  const setInitMarketData = async (symbol) => {
    let activeMarketData = {}
    if (activeExchange.exchange == 'binance') {
      activeMarketData = await binance.fetchTicker(symbol)
    } else if (activeExchange.exchange == 'binanceus') {
      activeMarketData = await binanceus.fetchTicker(symbol)
    } else if (activeExchange.exchange == 'kucoin') {
      activeMarketData = await kucoin.fetchTicker(symbol)
    }
    setMarketData(activeMarketData)
  }

  useEffect(() => {
    setExchangesFromTotalExchanges()
  }, [totalExchanges])

  // On mounted, make sure userData has been filled to avoid any FB token errors
  useEffect(() => {
    if (!userData) return
    getChartDataOnInit()
  }, [userData, watchListOpen, activeExchange, templateDrawingsOpen])

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
    try {
      const exchange =
        templateDrawingsOpen && watchListOpen
          ? 'binance'
          : activeExchange.exchange
      const { data } = await getAllChartData()
      let { intervals, lastSelectedSymbol, timeZone } = data
      let activeMarketData = {}
      const chartData = {
        intervals: intervals || [],
        timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        lastSelectedSymbol:
          lastSelectedSymbol ||
          `${DEFAULT_EXCHANGE}:${DEFAULT_SYMBOL_LOAD_SLASH}`,
      }

      setChartData({ ...chartData })
      let [exchangeVal, symbolVal] = chartData.lastSelectedSymbol.split(':')
      exchangeVal = exchange || exchangeVal.toLowerCase() || DEFAULT_EXCHANGE
      symbolVal = symbolVal || DEFAULT_SYMBOL_LOAD_SLASH
      localStorage.setItem('selectedExchange', exchangeVal)
      localStorage.setItem('selectedSymbol', symbolVal)
      const [baseAsset, qouteAsset] = symbolVal.split('/')
      loadBalance(qouteAsset, baseAsset)
      setInitMarketData(symbolVal)
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
      errorNotification.open({
        description: `Error getting last price of market.`,
        key: 'last-price-warning',
      })
      setSelectedSymbolLastPrice(0)
    } finally {
      setIsLoadingLastPrice(false)
    }
  }

  const setSymbol = useCallback(
    async (symbol) => {
      if (!symbol || symbol?.value === selectedSymbol?.value) return
      const symbolT = symbol.label.replace('-', '/')
      localStorage.setItem('selectedSymbol', symbolT)
      setSymbolType(symbolT)
      setSelectedSymbolDetail(symbolDetails[symbol.value])
      setSelectedSymbol(symbol)
      if (!watchListOpen) {
        loadBalance(symbol.quote_asset, symbol.base_asset)
        setInitMarketData(symbolT)
        try {
          await saveLastSelectedMarketSymbol(symbol.value)
        } catch (e) {
          console.log(e)
        }
      }
    },
    [selectedSymbol?.value, symbolDetails, watchListOpen]
  )

  useEffect(() => {
    if (!selectedSymbol || !selectedSymbolDetail) return

    const [baseAsset, quoteAsset] = selectedSymbol.label.split('-')
    if (
      !(
        selectedSymbol.value.includes(baseAsset) &&
        selectedSymbol.value.includes(quoteAsset)
      )
    )
      return

    if (watchListOpen) return

    if (selectedSymbol.value !== selectedSymbolDetail.value) {
      console.log(
        'Trade panel issue log: ',
        selectedSymbol,
        selectedSymbolDetail
      )
      setSelectedSymbolDetail(symbolDetails[selectedSymbol.value])
    }
  }, [
    isLoadingExchanges,
    isLoadingLastPrice,
    selectedSymbol,
    selectedSymbolDetail,
    symbolDetails,
    watchListOpen,
  ])

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
      const val = `${exchange.exchange.toUpperCase()}:${DEFAULT_SYMBOL_LOAD_SLASH}`
      await setSymbol({ label: DEFAULT_SYMBOL_LOAD_DASH, value: val })
    } catch (e) {
      errorNotification.open({
        description: `Error activating this exchange key!`,
      })
    } finally {
    }
  }

  // Handle no symbol type logic when exchange switched.
  // when exchange switch, if new exchange doesn't have the old exchange's symbol, set default symbol.
  useEffect(() => {
    if (
      binanceDD.length === 0 ||
      binanceUSDD.length === 0 ||
      kucoinDD.length === 0 ||
      !exchangeType ||
      !symbolType ||
      watchListOpen
    ) {
      return
    }

    let selectedDD = []
    switch (exchangeType) {
      case 'binance':
        selectedDD = [...binanceDD]
        break
      case 'binanceus':
        selectedDD = [...binanceUSDD]
        break
      case 'kucoin':
        selectedDD = [...kucoinDD]
        break

      default:
        break
    }

    const selectedSymbol = selectedDD.find(
      (symbol) => symbol.symbolpair === symbolType
    )

    if (!selectedSymbol) {
      const val = `${exchangeType}:${DEFAULT_SYMBOL_LOAD_SLASH}`
      setSymbol({ label: DEFAULT_SYMBOL_LOAD_DASH, value: val })
    }
  }, [
    exchangeType,
    symbolType,
    binanceDD,
    binanceUSDD,
    kucoinDD,
    setSymbol,
    DEFAULT_SYMBOL_LOAD_SLASH,
    DEFAULT_SYMBOL_LOAD_DASH,
  ])

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
    try {
      setIsLoadingBalance(true)
      if (selectedSymbolDetail?.quote_asset) {
        await loadBalance(
          selectedSymbolDetail.quote_asset,
          selectedSymbolDetail.base_asset
        )
      }
    } catch (error) {
      console.log(error)
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
        marketData,
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
