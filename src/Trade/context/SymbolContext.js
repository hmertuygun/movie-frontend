import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from 'react'

import {
  getExchanges,
  getBalance,
  getLastPrice,
  saveLastSelectedMarketSymbol,
} from '../../api/api'
import { UserContext } from '../../contexts/UserContext'
import {
  errorNotification,
  successNotification,
} from '../../components/Notifications'
import { firebase } from '../../firebase/firebase'
import { defaultEmojis } from '../../constants/emojiDefault'
import {
  updateTemplateDrawings,
  getFirestoreDocumentData,
  updateLastSelectedValue,
} from '../../api/firestoreCall'
import { execExchangeFunc } from '../../helpers/getExchangeProp'
import { sortExchangesData } from '../../helpers/apiKeys'

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
  const [timer, setTimer] = useState(null)
  const [exchangeType, setExchangeType] = useState(null)
  const [symbolType, setSymbolType] = useState(null)
  const [binanceDD, setBinanceDD] = useState([])
  const [ftxDD, setFtxDD] = useState([])
  const [kucoinDD, setKucoinDD] = useState([])
  const [binanceUSDD, setBinanceUSDD] = useState([])
  const [bybitDD, setBybitDD] = useState([])
  const [isLoadingExchanges, setIsLoadingExchanges] = useState(true)
  const [watchListOpen, setWatchListOpen] = useState(false)
  const [templateDrawings, setTemplateDrawings] = useState(false)
  const [templateDrawingsOpen, setTemplateDrawingsOpen] = useState(false)
  const [chartData, setChartData] = useState(null)
  const [marketData, setMarketData] = useState({})
  const [exchangeUpdated, setExchangeUpdated] = useState(false)
  const [emojis, setEmojis] = useState(defaultEmojis)
  const [selectEmojiPopoverOpen, setSelectEmojiPopoverOpen] = useState(false)
  const orderHistoryTimeInterval = 10000
  const openOrdersTimeInterval = 5000
  const portfolioTimeInterval = 20000
  const positionTimeInterval = 20000
  const analyticsTimeInterval = 20000

  useEffect(() => {
    const interval = setInterval(() => {
      const orderHistoryLS = localStorage.getItem('orderHistoryRefreshBtn')
      const openOrdersLS = localStorage.getItem('openOrdersRefreshBtn')
      const portfolioLS = localStorage.getItem('portfolioRefreshBtn')
      const positionLS = localStorage.getItem('positionRefreshBtn')
      const analyticsLS = localStorage.getItem('analyticsRefreshBtn')

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

      if (analyticsLS && Date.now() - analyticsLS < analyticsTimeInterval)
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

    //loadBalance(qouteAsset, baseAsset)
    loadLastPrice(selectedSymbol.label.replace('-', '/'))
  }, [selectedSymbol])

  const setInitMarketData = async (symbol) => {
    let activeMarketData = {}
    if (activeExchange?.exchange) {
      try {
        activeMarketData = await execExchangeFunc(
          activeExchange?.exchange,
          'fetchTicker',
          { symbol }
        )
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
    } else if (type === 'analytics') {
      setDisableAnalyticsRefreshBtn(true)
      localStorage.setItem('analyticsRefreshBtn', dateNow)
    }
  }

  const handleSaveEmojis = async () => {
    try {
      const value = {
        drawings: templateDrawings && templateDrawings.drawings,
        name: userData.email,
        nickname: userData.email,
        flags: emojis,
      }
      await updateTemplateDrawings(userData.email, value)
      successNotification.open({
        description: 'Emojis saved successfully',
      })
    } catch (error) {
      errorNotification.open({
        description: `Emojis not saved. Please try again later`,
      })
    }
  }

  useEffect(() => {
    getFirestoreDocumentData(
      'template_drawings',
      'sheldonthesniper01@gmail.com'
    )
      .then((emoji) => {
        if (emoji.data()) {
          if (emoji.data()?.flags) {
            localStorage.setItem('flags', JSON.stringify(emoji.data()?.flags))
            setEmojis(emoji.data()?.flags)
          }
        }
      })
      .catch((err) => console.log(err))
  }, [db, watchListOpen])

  const getChartDataOnInit = async () => {
    try {
      const exchange =
        templateDrawingsOpen && watchListOpen
          ? 'binance'
          : activeExchange.exchange
      getFirestoreDocumentData('chart_drawings', userData.email).then(
        (userSnapShot) => {
          let { intervals, lastSelectedSymbol, timeZone } = userSnapShot?.data()
          let activeMarketData = {}
          const chartData = {
            intervals: intervals || [],
            timeZone:
              timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            lastSelectedSymbol:
              lastSelectedSymbol ||
              `${DEFAULT_EXCHANGE}:${DEFAULT_SYMBOL_LOAD_SLASH}`,
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
          localStorage.setItem('selectedExchange', exchangeVal)
          localStorage.setItem('selectedSymbol', symbolVal)
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
          // loadLastPrice(symbolVal, exchangeVal)
          setExchangeType(exchange.toLowerCase())
          localStorage.setItem('selectedExchange', exchange.toLowerCase())
        }
      )
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
      const response = await getLastPrice(
        symbolpair,
        exchangeParam || activeExchange?.exchange
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
      setExchangeUpdated(true)
      setLoaderVisibility(true)
      let value = `${exchange.apiKeyName}-${exchange.exchange}`
      await updateLastSelectedValue(userData.email, value)
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
      bybitDD.length === 0 ||
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
      case 'bybit':
        selectedDD = [...bybitDD]
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
    bybitDD,
    setSymbol,
    DEFAULT_SYMBOL_LOAD_SLASH,
    DEFAULT_SYMBOL_LOAD_DASH,
    watchListOpen,
  ])

  const loadExchanges = async (symbol, exchange) => {
    try {
      //if (!userData) return
      setIsLoadingExchanges(true)
      const data = await getExchanges()
      if (!data?.exchanges?.length || !data?.symbolsChange) {
        return
      }

      const [binance, ftx, binanceus, kucoin, bybit] = data.exchanges
      setSymbols(() => [
        ...binance.symbols,
        ...binanceus.symbols,
        ...kucoin.symbols,
        ...bybit.symbols,
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
      setBybitDD(() => bybit.symbols)
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
        disableAnalyticsRefreshBtn,
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
        bybitDD,
        watchListOpen,
        setWatchListOpen,
        templateDrawings,
        setTemplateDrawings,
        templateDrawingsOpen,
        setTemplateDrawingsOpen,
        marketData,
        chartData,
        setEmojis,
        emojis,
        handleSaveEmojis,
        selectEmojiPopoverOpen,
        setSelectEmojiPopoverOpen,
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
