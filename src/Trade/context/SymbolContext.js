import React, {
  createContext,
  useCallback,
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
import { useQuery } from 'react-query'
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
    loadApiKeys
  } = useContext(UserContext)
  const INITIAL_SYMBOL_LOAD_SLASH = 'BTC/USDT'
  const INITIAL_SYMBOL_LOAD_DASH = 'BTC-USDT'
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

  const setSymbolFromExchangeOnLoad = async (symbolDetails) => {
    if (!activeExchange?.exchange) return
    const { exchange } = activeExchange
    const getLSS = await getLastSelectedMarketSymbol()
    const [exchangeAPI, symbolAPI] = getLSS?.lastSelectedSymbol.split(":")
    const getExchangeFromLS = exchangeAPI || localStorage.getItem('selectedExchange') || exchange
    const getSymbolFromLS = symbolAPI || localStorage.getItem('selectedSymbol') || INITIAL_SYMBOL_LOAD_SLASH
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
    if (!selectedSymbol || !Object.keys(symbolDetails).length) return
    setSelectedSymbolDetail(symbolDetails[selectedSymbol.value])
    const [baseAsset, qouteAsset] = selectedSymbol.label.split("-")
    loadBalance(qouteAsset, baseAsset)
    loadLastPrice(selectedSymbol.label.replace('-', '/'))
  }, [selectedSymbol])

  useEffect(() => {
    loadExchanges()
  }, [activeExchange.exchange])

  const loadBalance = async (quote_asset, base_asset) => {
    try {
      if (!activeExchange?.exchange) return
      setIsLoadingBalance(true)

      const quoteBalance = await getBalance({ symbol: quote_asset, ...activeExchange })
      if (quoteBalance?.data?.balance) setSelectedSymbolBalance(quoteBalance.data.balance)
      else setSelectedSymbolBalance(0)

      const baseBalance = await getBalance({ symbol: base_asset, ...activeExchange })
      if (baseBalance?.data?.balance) setSelectedBaseSymbolBalance(baseBalance.data.balance)
      else setSelectedBaseSymbolBalance(0)

    } catch (err) {
      console.error(err)
      setSelectedSymbolBalance(0)
      setSelectedBaseSymbolBalance(0)
    } finally {
      setIsLoadingBalance(false)
    }
  }

  const loadLastPrice = async (symbolpair) => {
    try {
      if (!activeExchange?.exchange) return
      setIsLoadingLastPrice(true)
      const { exchange } = activeExchange
      const response = await backOff(() => getLastPrice(symbolpair, exchange))
      if (response?.data?.lastPrice !== 'NA') setSelectedSymbolLastPrice(response.data.lastPrice)
      else setSelectedSymbolLastPrice(0)
    } catch (err) {
      console.error(err)
      setSelectedSymbolLastPrice(0)
    } finally {
      setIsLoadingLastPrice(false)
    }
  }

  const setSymbol = async (symbol) => {
    if (!symbol || symbol?.value === selectedSymbol?.value) return
    const symbolT = symbol.label.replace('-', '/')
    setSymbolType(symbolT)
    setSelectedSymbol(symbol)
    localStorage.setItem('selectedSymbol', symbolT)
    try {
      await saveLastSelectedMarketSymbol(symbol.value)
    }
    catch (e) {
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

  const loadExchanges = async () => {
    try {
      if (!userData) return
      setIsLoadingExchanges(true)
      setExchangesFromTotalExchanges()
      const data = await getExchanges()
      if (!data?.exchanges?.length || !data?.keyValues) {
        return
      }
      const [binance, ftx] = data.exchanges
      setSymbols(() => [...binance.symbols, ...ftx.symbols])
      setSymbolDetails(data.keyValues)
      setBinanceDD(() => binance.symbols)
      setFtxDD(() => ftx.symbols)
      setSymbolFromExchangeOnLoad(data.keyValues)
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
