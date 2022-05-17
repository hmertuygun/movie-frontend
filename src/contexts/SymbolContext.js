import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from 'react'
import { useNotifications } from 'reapop'

import {
  getExchanges,
  getOneExchange,
  saveLastSelectedMarketSymbol,
  getBalance,
  getLastPrice,
  updateTemplateDrawings,
  getFirestoreDocumentData,
  updateLastSelectedValue,
  getSnapShotDocument,
} from 'services/api'
import { UserContext } from 'contexts/UserContext'
import { firebase } from 'services/firebase'
import { defaultEmojis } from 'constants/emojiDefault'
import { sortExchangesData } from 'utils/apiKeys'
import { getSelectedExchange } from 'utils/exchangeSelection'
import { TEMPLATE_DRAWINGS_USERS } from 'constants/TemplateDrawingsList'
import { storage } from 'services/storages'
import { fetchTicker } from 'services/exchanges'

import LZUTF8 from 'lzutf8'
import { useLocation } from 'react-router-dom'

export const SymbolContext = createContext()
const db = firebase.firestore()

const SymbolContextProvider = ({ children }) => {
  const {
    activeExchange,
    setActiveExchange,
    totalExchanges,
    setLoaderVisibility,
    setOpenOrdersUC,
    userData,
    isOnboardingSkipped,
    isLoggedIn,
    isAnalyst,
  } = useContext(UserContext)
  const { notify } = useNotifications()
  const location = useLocation()

  const DEFAULT_SYMBOL_LOAD_SLASH = 'BTC/USDT'
  const DEFAULT_SYMBOL_LOAD_DASH = 'BTC-USDT'
  const DEFAULT_EXCHANGE = 'BINANCE'
  const [disableOrderHistoryRefreshBtn, setDisableOrderHistoryRefreshBtn] =
    useState(false)
  const [disableOpenOrdersRefreshBtn, setDisableOpenOrdesrRefreshBtn] =
    useState(false)
  const [disablePortfolioRefreshBtn, setDisablePortfolioRefreshBtn] =
    useState(false)
  const [disableAnalyticsRefreshBtn, setDisableAnalyticsRefreshBtn] =
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
  const [isExchangeLoading, setIsExchangeLoading] = useState(true)
  const [exchangeType, setExchangeType] = useState(null)
  const [symbolType, setSymbolType] = useState(null)
  const [activeDD, setActiveDD] = useState([])
  const [isLoadingExchanges, setIsLoadingExchanges] = useState(true)
  const [watchListOpen, setWatchListOpen] = useState(false)
  const [templateDrawings, setTemplateDrawings] = useState(false)
  const [templateDrawingsOpen, setTemplateDrawingsOpen] = useState(false)
  const [isTradersModalOpen, setIsTradersModalOpen] = useState(false)
  const [activeTrader, setActiveTrader] = useState({})
  const [chartData, setChartData] = useState(null)
  const [marketData, setMarketData] = useState({})
  const [exchangeUpdated, setExchangeUpdated] = useState(false)
  const [emojis, setEmojis] = useState(defaultEmojis)
  const [selectEmojiPopoverOpen, setSelectEmojiPopoverOpen] = useState(false)
  const [lastMarketPrice, setLastMarketPrice] = useState()
  const orderHistoryTimeInterval = 10000
  const openOrdersTimeInterval = 5000
  const portfolioTimeInterval = 20000
  const analyticsTimeInterval = 20000
  const isOnMarket = useMemo(() => {
    return location.pathname === '/market'
  }, [location])

  useEffect(() => {
    const interval = setInterval(() => {
      const orderHistoryLS = storage.get('orderHistoryRefreshBtn')
      const openOrdersLS = storage.get('openOrdersRefreshBtn')
      const portfolioLS = storage.get('portfolioRefreshBtn')
      const analyticsLS = storage.get('analyticsRefreshBtn')

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

      if (analyticsLS && Date.now() - analyticsLS < analyticsTimeInterval)
        setDisableAnalyticsRefreshBtn(true)
      else setDisableAnalyticsRefreshBtn(false)
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
    storage.set('selectedExchange', exchange)
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

    //loadBalance(qouteAsset, baseAsset)
    loadLastPrice(selectedSymbol.label.replace('-', '/'))
  }, [selectedSymbol])

  const setInitMarketData = async (symbol) => {
    let activeMarketData = {}
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const exchange = await getSelectedExchange(activeExchange?.exchange)
    if (exchange) {
      try {
        activeMarketData = await fetchTicker(exchange, symbol)
        setMarketData(activeMarketData)
      } catch (error) {
        console.log(error)
      }
    }
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
      storage.set('orderHistoryRefreshBtn', dateNow)
    } else if (type === 'open-order') {
      setDisableOpenOrdesrRefreshBtn(true)
      storage.set('openOrdersRefreshBtn', dateNow)
    } else if (type === 'portfolio') {
      setDisablePortfolioRefreshBtn(true)
      storage.set('portfolioRefreshBtn', dateNow)
    } else if (type === 'analytics') {
      setDisableAnalyticsRefreshBtn(true)
      storage.set('analyticsRefreshBtn', dateNow)
    }
  }

  const handleSaveEmojis = async () => {
    try {
      const value = {
        flags: emojis,
      }
      await updateTemplateDrawings(userData.email, value)
      notify({
        status: 'success',
        title: 'Success',
        message: 'Emojis saved successfully!',
      })
    } catch (error) {
      notify({
        status: 'error',
        title: 'Error',
        message: 'Emojis not saved. Please try again later!',
      })
    }
  }

  useEffect(() => {
    let userEmail = isAnalyst ? userData.email : activeTrader.id

    getFirestoreDocumentData('chart_shared', userEmail)
      .then((emoji) => {
        if (emoji.data()) {
          if (emoji.data()?.flags) {
            storage.set('flags', JSON.stringify(emoji.data()?.flags))
            setEmojis(emoji.data()?.flags)
          }
        }
      })
      .catch((err) => console.log(err))
  }, [db, watchListOpen, activeTrader, userData.email])
  const getChartDataOnInit = async () => {
    try {
      const exchange =
        templateDrawingsOpen && watchListOpen
          ? 'binance'
          : activeExchange.exchange
      getFirestoreDocumentData('chart_drawings', userData.email).then(
        (userSnapShot) => {
          let value = userSnapShot?.data()

          let intervals = value && value.intervals
          let lastSelectedSymbol = value && value.lastSelectedSymbol
          let timeZone = value && value.timeZone
          let activeMarketData = {}
          const chartData = {
            intervals: intervals || [],
            timeZone:
              timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            lastSelectedSymbol: `${DEFAULT_EXCHANGE}:${DEFAULT_SYMBOL_LOAD_SLASH}`,
          }

          setChartData({ ...chartData })
          let [exchangeVal, symbolVal] = chartData.lastSelectedSymbol.split(':')
          exchangeVal =
            exchange || exchangeVal.toLowerCase() || DEFAULT_EXCHANGE
          symbolVal = exchangeUpdated
            ? DEFAULT_SYMBOL_LOAD_SLASH
            : symbolVal
            ? symbolVal
            : DEFAULT_SYMBOL_LOAD_SLASH
          storage.set('selectedExchange', exchangeVal)
          storage.set('selectedSymbol', symbolVal)
          const [baseAsset, qouteAsset] = symbolVal.split('/')
          loadBalance(qouteAsset, baseAsset)
          setSelectedSymbolDetail({
            base_asset: baseAsset,
            quote_asset: qouteAsset,
          }) // to show balance in trade panel quickly
          setSymbolType(symbolVal)
          loadExchanges(symbolVal, exchangeVal)
          setSelectedSymbol({
            label: symbolVal.replace('/', '-'),
            value: `${exchangeVal.toUpperCase()}:${symbolVal}`,
          })
          loadLastPrice(symbolVal, exchangeVal)
          setExchangeType(exchange.toLowerCase())
          storage.set('selectedExchange', exchange.toLowerCase())
        }
      )
    } catch (e) {
      console.error(e)
    } finally {
    }
  }

  const loadBalance = async (quote_asset, base_asset, skipCache = false) => {
    try {
      // solves an issue where you get incorrect symbol balance by clicking on diff symbols rapidly
      const getSymbolFromLS = storage.get('selectedSymbol')
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
          skipCache,
          ...activeExchange,
        })
        if (quoteBalance?.data?.balance)
          setSelectedSymbolBalance(quoteBalance.data.balance)
        else setSelectedSymbolBalance(0)

        const baseBalance = await getBalance({
          symbol: base_asset,
          skipCache,
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
    if (isLoggedIn && !isOnMarket) {
      try {
        setIsLoadingLastPrice(true)
        const response = await getLastPrice(
          symbolpair,
          exchangeParam ||
            storage.get('selectedExchange') ||
            activeExchange?.exchange
        )
        if (response?.data?.last_price !== 'NA')
          setSelectedSymbolLastPrice(response.data.last_price)
        else setSelectedSymbolLastPrice(0)
      } catch (err) {
        notify({
          id: 'last-price-warning',
          status: 'error',
          title: 'Error',
          message: 'Error getting last price of market!',
        })
        setSelectedSymbolLastPrice(0)
      } finally {
        setIsLoadingLastPrice(false)
      }
    }
  }

  const setSymbol = useCallback(
    async (symbol) => {
      if (
        !symbol ||
        symbol?.value === selectedSymbol?.value ||
        !symbolDetails[symbol.value]
      )
        return
      const symbolT = symbol.label.replace('-', '/')
      storage.set('selectedSymbol', symbolT)
      setSymbolType(symbolT)
      setSelectedSymbolDetail(symbolDetails[symbol.value])
      setSelectedSymbol(symbol)
      setInitMarketData(symbolT)
      if (!watchListOpen) {
        loadBalance(symbol.quote_asset, symbol.base_asset)
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
    if (
      activeDD.length === 0 ||
      !exchangeType ||
      !symbolType ||
      watchListOpen
    ) {
      return
    }

    const selectedSymbol = activeDD.find(
      (symbol) => symbol.symbolpair === symbolType
    )
    if (!selectedSymbol) {
      const val = `${exchangeType}:${DEFAULT_SYMBOL_LOAD_SLASH}`
      setSymbol({ label: DEFAULT_SYMBOL_LOAD_DASH, value: val })
    }
  }, [
    exchangeType,
    symbolType,
    activeDD,
    setSymbol,
    DEFAULT_SYMBOL_LOAD_SLASH,
    DEFAULT_SYMBOL_LOAD_DASH,
    watchListOpen,
  ])

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
      setExchangeUpdated(true)
      setLoaderVisibility(true)
      let value = `${exchange.apiKeyName}__${exchange.exchange}`
      await updateLastSelectedValue(userData.email, value)
      setActiveExchange(exchange)
      sessionStorage.setItem('exchangeKey', JSON.stringify(exchange))
      const val = `${exchange.exchange.toUpperCase()}:${DEFAULT_SYMBOL_LOAD_SLASH}`
      await setSymbol({ label: DEFAULT_SYMBOL_LOAD_DASH, value: val })
    } catch (e) {
      notify({
        status: 'error',
        title: 'Error',
        message: 'Error activating this exchange key!',
      })
    } finally {
    }
  }

  const loadExchanges = async (symbol, exchange) => {
    try {
      //if (!userData) return
      setIsLoadingExchanges(true)
      setIsExchangeLoading(true)
      const oneExchangeResp = await getOneExchange(exchange)
      if (
        !oneExchangeResp?.exchanges?.length ||
        !oneExchangeResp?.symbolsChange
      ) {
        return
      }
      setSymbolDetails(oneExchangeResp.symbolsChange)
      setActiveDD(oneExchangeResp.exchanges[0].symbols)
      setIsExchangeLoading(false)
      const val = `${exchange.toUpperCase()}:${symbol}`
      setSelectedSymbolDetail(oneExchangeResp.symbolsChange[val])
      const data = await getExchanges()
      if (!data?.exchanges?.length || !data?.symbolsChange) {
        return
      }

      //get all exchanges and symbols
      const allSymbols = data.exchanges
        .filter(function (e) {
          return e.exchange !== 'ftx'
        })
        .map(function (val) {
          return val.symbols
        })
        .reduce(function (pre, cur) {
          return pre.concat(cur)
        })
        .map(function (e, i) {
          return e
        })

      setSymbols(allSymbols)
      setSymbolDetails(data.symbolsChange)
      storage.set('symbolsKeyValue', JSON.stringify(data.symbolsChange))
    } catch (error) {
      console.error(error)
      setIsExchangeLoading(false)
    } finally {
      setIsLoadingExchanges(false)
      setIsExchangeLoading(false)
    }
  }

  const refreshBalance = async () => {
    try {
      setIsLoadingBalance(true)
      if (selectedSymbolDetail?.quote_asset) {
        await loadBalance(
          selectedSymbolDetail.quote_asset,
          selectedSymbolDetail.base_asset,
          true
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
    if (userData.email) {
      try {
        getFirestoreDocumentData('apiKeyIDs', userData.email).then((apiKey) => {
          if (apiKey.data()) {
            let apiKeys = sortExchangesData(apiKey.data())
            if (!apiKeys.length) return
            const keys = apiKeys.map((item) => {
              return {
                ...item,
                label: `${item.exchange} - ${item.apiKeyName}`,
                value: `${item.exchange} - ${item.apiKeyName}`,
              }
            })
            setExchanges(keys)
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  const setActiveAnalysts = async (planned = null) => {
    let trader = ''
    if (!planned) {
      const snapshot = await getSnapShotDocument(
        'chart_drawings',
        userData.email
      ).get()

      const data = snapshot.data()
      if (!data.activeTrader) return
      trader = data.activeTrader
    } else if (planned) {
      trader = planned
    }
    const sharedData = await getSnapShotDocument('chart_shared', trader).get()
    const analystData = await getSnapShotDocument('analysts', trader).get()

    let converted = ''
    try {
      converted = sharedData.data().drawings
      const check = JSON.parse(sharedData.data()?.drawings)
    } catch (error) {
      converted = LZUTF8.decompress(sharedData.data().drawings, {
        inputEncoding: 'Base64',
      })
    }

    const processedData = {
      ...sharedData.data(),
      ...analystData.data(),
      id: sharedData.id,
      drawings: converted,
    }

    setActiveTrader(processedData)
  }

  return (
    <SymbolContext.Provider
      value={{
        isLoading: !selectedSymbolDetail || isExchangeLoading,
        isExchangeLoading,
        exchanges,
        disableOrderHistoryRefreshBtn,
        disableOpenOrdersRefreshBtn,
        disablePortfolioRefreshBtn,
        disableAnalyticsRefreshBtn,
        orderHistoryTimeInterval,
        openOrdersTimeInterval,
        portfolioTimeInterval,
        onRefreshBtnClicked,
        refreshExchanges,
        setExchange,
        symbols,
        setSymbol,
        setActiveAnalysts,
        selectedSymbol,
        symbolDetails,
        selectedSymbolDetail,
        selectedSymbolBalance,
        selectedBaseSymbolBalance,
        isLoadingBalance,
        isLoadingLastPrice,
        activeDD,
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
        watchListOpen,
        setWatchListOpen,
        templateDrawings,
        setTemplateDrawings,
        templateDrawingsOpen,
        setTemplateDrawingsOpen,
        isTradersModalOpen,
        setIsTradersModalOpen,
        activeTrader,
        setActiveTrader,
        marketData,
        chartData,
        setEmojis,
        emojis,
        handleSaveEmojis,
        selectEmojiPopoverOpen,
        setSelectEmojiPopoverOpen,
        setExchanges,
        setLastMarketPrice,
        lastMarketPrice,
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
