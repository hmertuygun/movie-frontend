import React, {
  createContext,
  useEffect,
  useState,
  useContext,
} from 'react'
import { backOff } from 'exponential-backoff'
import ReconnectingWebSocket from 'reconnecting-websocket'
import * as Sentry from '@sentry/browser'

import {
  getExchanges,
  getBalance,
  getLastPrice,
  getUserExchanges,
  updateLastSelectedAPIKey,
  get24hrTickerPrice,
  getLastSelectedMarketSymbol,
  saveLastSelectedMarketSymbol
} from '../../api/api'
import { UserContext } from '../../contexts/UserContext'
import { errorNotification } from '../../components/Notifications'
import ccxt from 'ccxt'
import { useLocalStorage } from '@rehooks/local-storage'
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
    loadApiKeys
  } = useContext(UserContext)
  // const [lsFetchingBalance] = useLocalStorage('fetchingBalance')
  const INITIAL_SYMBOL_LOAD_SLASH = 'BTC/USDT'
  const INITIAL_SYMBOL_LOAD_DASH = 'BTC-USDT'
  const [disableOrderHistoryRefreshBtn, setDisableOrderHistoryRefreshBtn] = useState(false)
  const [disableOpenOrdersRefreshBtn, setDisableOpenOrdesrRefreshBtn] = useState(false)
  const [disablePortfolioRefreshBtn, setDisablePortfolioRefreshBtn] = useState(false)
  const [disablePositionRefreshBtn, setDisablePositionRefreshBtn] = useState(false)
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
  const [binanceDD, setBinanceDD] = useState([])
  const [ftxDD, setFtxDD] = useState([])
  const [isLoadingExchanges, setIsLoadingExchanges] = useState(true)
  const [watchListOpen, setWatchListOpen] = useState(false)
  const orderHistoryTimeInterval = 10000
  const openOrdersTimeInterval = 5000
  const portfolioTimeInterval = 20000
  const positionTimeInterval = 20000
  let disableBtnInterval = null

  useEffect(() => {
    checkDisableBtnStatus()
  }, [])

  const checkDisableBtnStatus = () => {
    disableBtnInterval = setInterval(() => {
      const orderHistoryLS = localStorage.getItem('orderHistoryRefreshBtn')
      const openOrdersLS = localStorage.getItem('openOrdersRefreshBtn')
      const portfolioLS = localStorage.getItem('portfolioRefreshBtn')
      const positionLS = localStorage.getItem('positionRefreshBtn')

      if (orderHistoryLS && (Date.now() - orderHistoryLS < orderHistoryTimeInterval)) setDisableOrderHistoryRefreshBtn(true)
      else setDisableOrderHistoryRefreshBtn(false)

      if (openOrdersLS && (Date.now() - openOrdersLS < openOrdersTimeInterval)) setDisableOpenOrdesrRefreshBtn(true)
      else setDisableOpenOrdesrRefreshBtn(false)

      if (portfolioLS && (Date.now() - portfolioLS < portfolioTimeInterval)) setDisablePortfolioRefreshBtn(true)
      else setDisablePortfolioRefreshBtn(false)

      if (positionLS && (Date.now() - positionLS < positionTimeInterval)) setDisablePositionRefreshBtn(true)
      else setDisablePositionRefreshBtn(false)

    }, 1000)
  }

  const onRefreshBtnClicked = (type) => {
    const dateNow = Date.now()
    if (type === "order-history") {
      setDisableOrderHistoryRefreshBtn(true)
      localStorage.setItem('orderHistoryRefreshBtn', dateNow)
    }
    else if (type === "open-order") {
      setDisableOpenOrdesrRefreshBtn(true)
      localStorage.setItem('openOrdersRefreshBtn', dateNow)
    }
    else if (type === "portfolio") {
      setDisablePortfolioRefreshBtn(true)
      localStorage.setItem('portfolioRefreshBtn', dateNow)
    }
    else if (type === "position") {
      setDisablePositionRefreshBtn(true)
      localStorage.setItem('positionRefreshBtn', dateNow)
    }
  }

  const setSymbolFromExchangeOnLoad = async (symbolDetails) => {
    if (!activeExchange?.exchange) return
    const { exchange } = activeExchange
    const getLSS = await getLastSelectedMarketSymbol()
    const [exchangeAPI, symbolAPI] = getLSS?.lastSelectedSymbol.split(":")
    const getExchangeFromLS = exchangeAPI || localStorage.getItem('selectedExchange') || exchange
    const getSymbolFromLS = symbolAPI || localStorage.getItem('selectedSymbol') || INITIAL_SYMBOL_LOAD_SLASH
    if (!localStorage.getItem('selectedExchange')) localStorage.setItem('selectedExchange', getExchangeFromLS.toLowerCase())
    if (!localStorage.getItem('selectedSymbol')) localStorage.setItem('selectedSymbol', getSymbolFromLS)
    const symbolVal = `${getExchangeFromLS.toUpperCase()}:${getSymbolFromLS}`
    const [baseAsset, qouteAsset] = getSymbolFromLS.split('/')
    // loadBalance(qouteAsset, baseAsset)
    // loadLastPrice(getSymbolFromLS.replace('/', ''))
    setExchangeType(getExchangeFromLS)
    setSymbolType(getSymbolFromLS)
    setSelectedSymbol({ label: getSymbolFromLS.replace('/', '-'), value: symbolVal })
    setSelectedSymbolDetail(symbolDetails[symbolVal])
  }

  useEffect(() => {
    const { exchange } = activeExchange

    let socketURL = ''
    switch (exchange) {
      case 'binance':
        socketURL = 'wss://stream.binance.com:9443/stream'
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
  }, [activeExchange])

  useEffect(() => {
    const { exchange } = activeExchange
    if (!socketLiveUpdate) {
      if (timer) clearInterval(timer)
      switch (exchange) {
        case 'binance':
          {
            const getFirstData = async () => {
              const data = await get24hrTickerPrice()
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
  }, [socketLiveUpdate, activeExchange])

  async function loadBalance(quote_asset, base_asset) {
    try {
      if (!activeExchange?.exchange) return
      setIsLoadingBalance(true)
      //localStorage.setItem('fetchingBalance', true)
      const response = await Promise.all([
        await getBalance({
          symbol: quote_asset,
          ...activeExchange,
        }),
        await getBalance({
          symbol: base_asset,
          ...activeExchange,
        }),
      ])
      // solves an issue where you get incorrect symbol balance by clicking on diff symbols rapidly
      const getSymbolFromLS = localStorage.getItem('selectedSymbol')
      console.log(getSymbolFromLS && `${base_asset}/${quote_asset}` !== getSymbolFromLS)
      if (getSymbolFromLS && `${base_asset}/${quote_asset}` !== getSymbolFromLS) return
      else setIsLoadingBalance(true)
      if ('balance' in response[0].data && 'balance' in response[1].data) {
        setSelectedSymbolBalance(response[0].data['balance'])
        setSelectedBaseSymbolBalance(response[1].data['balance'])
      } else {
        console.log('no balance found for ' + quote_asset)
        setSelectedSymbolBalance(0)
        setSelectedBaseSymbolBalance(0)
      }
    } catch (err) {
      setSelectedSymbolBalance(0)
      setSelectedBaseSymbolBalance(0)
    } finally {
      setIsLoadingBalance(false)
      //localStorage.setItem('fetchingBalance', false)
    }
  }

  async function loadLastPrice(symbolpair) {
    try {
      if (!activeExchange?.exchange) return
      setIsLoadingLastPrice(true)
      const { exchange } = activeExchange
      const response = await backOff(() => getLastPrice(symbolpair, exchange))
      if (symbolpair !== localStorage.getItem('selectedSymbol')) return
      if (
        'last_price' in response.data &&
        response.data['last_price'] !== 'NA'
      ) {
        console.log('setting last price for ' + symbolpair)
        setSelectedSymbolLastPrice(response.data['last_price'])
      } else {
        console.log('no last price found for ' + symbolpair)
        setSelectedSymbolLastPrice(0)
      }
    } catch (Exception) {
      setSelectedSymbolLastPrice(0)
    } finally {
      setIsLoadingLastPrice(false)
    }
  }

  async function setSymbol(symbol) {
    if (!symbol || symbol?.value === selectedSymbol?.value) return
    localStorage.setItem('selectedSymbol', symbol.label.replace('-', '/'))
    setSelectedSymbol(symbol)
    setSymbolType(symbol.label.replace('-', '/'))
    try {
      await saveLastSelectedMarketSymbol(symbol.value)
    }
    catch (e) {
      console.log(e)
    }
  }

  async function setExchange(exchange) {
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

  // const queryExchanges = useQuery('exchangeSymbols', getExchanges, {
  //   refetchOnWindowFocus: false,
  // })

  const loadExchanges = async () => {
    try {
      if (!userData) return
      setIsLoadingExchanges(true)
      const data = await getExchanges() //queryExchanges.data
      const symbolList = []
      const ftxList = []
      const binanceList = []
      const symbolDetails = {}
      const pn = performance.now()
      // const getSymbolFromLS = localStorage.getItem('selectedSymbol') || INITIAL_SYMBOL_LOAD_SLASH
      // const [baseAsset, qouteAsset] = getSymbolFromLS.split('/')
      // loadBalance(qouteAsset, baseAsset)
      // loadLastPrice(getSymbolFromLS.replace('/', ''))
      setExchangesFromTotalExchanges()
      // Process symbols
      if (data['exchanges']) {
        data['exchanges'].forEach((exchange) => {
          // exchangeList.push(exchange['exchange'])
          exchange['symbols'].forEach((symbol) => {
            const value = exchange['exchange'].toUpperCase() + ':' + symbol['value']
            symbolList.push({
              label: symbol['label'],
              value: value,
            })
            if (exchange['exchange'] === "binance") {
              binanceList.push({
                label: symbol['label'],
                value: value,
              })
            }
            else if (exchange['exchange'] === "ftx") {
              ftxList.push({
                label: symbol['label'],
                value: value,
              })
            }
            let tickSize = symbol['tickSize']
            for (let i = 1; i < 10; i++) {
              tickSize = tickSize * 10
              if (tickSize === 1) {
                tickSize = i
                break
              }
            }

            let lotSize = symbol['stepSize']
            for (let i = 1; i < 10; i++) {
              lotSize = lotSize * 10
              if (lotSize === 1) {
                lotSize = i
                break
              }
            }
            symbolDetails[value] = {
              // BTCUSD
              symbolpair: symbol['value'],
              base_asset: symbol['base_asset'],
              quote_asset: symbol['quote_asset'],
              base_asset_precision: symbol['base_asset_precision'], // BTC
              quote_asset_precision: symbol['quote_asset_precision'], // USD
              maxPrice: symbol['maxPrice'],
              maxQty: symbol['maxQty'],
              minNotional: symbol['minNotional'],
              minPrice: symbol['minPrice'],
              minQty: symbol['minQty'],
              originalTickSize: symbol['tickSize'],
              tickSize: tickSize,
              lotSize: lotSize,
            }
          })
        })
        setSymbols(symbolList)
        setSymbolDetails(symbolDetails)
        setFtxDD(ftxList)
        setBinanceDD(binanceList)
        setSymbolFromExchangeOnLoad(symbolDetails)
        console.log(`Took ${parseFloat(performance.now() - pn).toFixed(2)} seconds to parse symbols`)
      } else {
        setExchanges([])
        setSymbols([])
      }
    } catch (error) {
      console.error(error)
    }
    finally {
      setIsLoadingExchanges(false)
    }
  }

  const refreshBalance = () => {
    if (selectedSymbolDetail?.quote_asset) {
      loadBalance(
        selectedSymbolDetail.quote_asset,
        selectedSymbolDetail.base_asset
      )
    }
  }

  useEffect(() => {
    const { exchange } = activeExchange
    if (!exchange || !selectedSymbolDetail?.base_asset) return
    setOpenOrdersUC(null)
    const symbolLabel = `${selectedSymbolDetail.base_asset}-${selectedSymbolDetail.quote_asset}`
    switch (exchange) {
      case 'binance': {
        const symbolValue = `BINANCE:${selectedSymbolDetail.base_asset}/${selectedSymbolDetail.quote_asset}`
        const details = symbolDetails[symbolValue]
        localStorage.setItem('selectedExchange', 'binance')
        if (details) {
          setSymbol({ label: symbolLabel, value: symbolValue })
          setSelectedSymbolDetail(details)
        } else {
          setSymbol({ label: INITIAL_SYMBOL_LOAD_DASH, value: `BINANCE:${INITIAL_SYMBOL_LOAD_SLASH}` })
          setSelectedSymbolDetail(symbolDetails[`BINANCE:${INITIAL_SYMBOL_LOAD_SLASH}`])
        }
        break
      }
      case 'ftx': {
        const symbolValue = `FTX:${selectedSymbolDetail.base_asset}/${selectedSymbolDetail.quote_asset}`
        const details = symbolDetails[symbolValue]
        if (details) {
          setSymbol({ label: symbolLabel, value: symbolValue })
          setSelectedSymbolDetail(details)
        } else {
          setSymbol({ label: INITIAL_SYMBOL_LOAD_DASH, value: `FTX:${INITIAL_SYMBOL_LOAD_SLASH}` })
          setSelectedSymbolDetail(symbolDetails[`FTX:${INITIAL_SYMBOL_LOAD_SLASH}`])
        }
        break
      }
      default:
        break
    }
  }, [activeExchange])

  useEffect(() => {
    if (!selectedSymbol) return
    setSelectedSymbolDetail(symbolDetails[selectedSymbol['value']])
    setSelectedSymbolBalance('')
    if (selectedSymbol['value'] in symbolDetails) {
      loadBalance(
        symbolDetails[selectedSymbol['value']]['quote_asset'],
        symbolDetails[selectedSymbol['value']]['base_asset']
      )
      loadLastPrice(symbolDetails[selectedSymbol['value']]['symbolpair'])
    }
  }, [selectedSymbol])

  useEffect(() => {
    loadExchanges()
  }, [activeExchange.exchange])

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
          value: `${item.exchange} - ${item.apiKeyName}`
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
        ftxDD,
        watchListOpen,
        setWatchListOpen,
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
