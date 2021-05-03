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

  const setSymbolFromExchangeOnLoad = (symbolDetails) => {
    if (!activeExchange?.exchange) return
    const { exchange } = activeExchange
    const getExchangeFromLS = localStorage.getItem('selectedExchange') || exchange
    const getSymbolFromLS = localStorage.getItem('selectedSymbol') || INITIAL_SYMBOL_LOAD_SLASH
    const symbolVal = `${getExchangeFromLS.toUpperCase()}:${getSymbolFromLS}`
    const [baseAsset, qouteAsset] = getSymbolFromLS.split('/')
    setExchangeType(getExchangeFromLS)
    setSymbolType(getSymbolFromLS)
    setSelectedSymbol({ label: getSymbolFromLS.replace('/', '-'), value: symbolVal })
    setSelectedSymbolDetail(symbolDetails[symbolVal])
    // loadBalance(qouteAsset, baseAsset)
    // loadLastPrice(getSymbolFromLS.replace('/', ''))
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
    }
  }

  async function loadLastPrice(symbolpair) {
    try {
      if (!activeExchange?.exchange) return
      setIsLoadingLastPrice(true)
      const { exchange } = activeExchange
      const response = await backOff(() => getLastPrice(symbolpair, exchange))
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

  function setSymbol(symbol) {
    if (!symbol || symbol?.value === selectedSymbol?.value) return
    setSelectedSymbol(symbol)
    setSymbolType(symbol.label.replace('-', '/'))
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

  const queryExchanges = useQuery('exchangeSymbols', getExchanges, {
    refetchOnWindowFocus: false,
  })

  const loadExchanges = useCallback(async () => {
    try {
      const data = queryExchanges.data //await getExchanges()
      const symbolList = []
      const ftxList = []
      const binanceList = []
      const symbolDetails = {}
      const pn = performance.now()
      const getSymbolFromLS = localStorage.getItem('selectedSymbol') || INITIAL_SYMBOL_LOAD_SLASH
      const [baseAsset, qouteAsset] = getSymbolFromLS.split('/')
      loadBalance(qouteAsset, baseAsset)
      loadLastPrice(getSymbolFromLS.replace('/', ''))
      setExchangesFromTotalExchanges()
      // Process symbols
      if (queryExchanges.status === 'success' && data['exchanges']) {
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
  }, [queryExchanges.data, queryExchanges.status, activeExchange, totalExchanges])

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
          localStorage.setItem('selectedSymbol', `${selectedSymbolDetail.base_asset}/${selectedSymbolDetail.quote_asset}`)
          setSelectedSymbol({ label: symbolLabel, value: symbolValue })
          setSelectedSymbolDetail(details)
        } else {
          localStorage.setItem('selectedSymbol', INITIAL_SYMBOL_LOAD_SLASH)
          setSelectedSymbol({ label: INITIAL_SYMBOL_LOAD_DASH, value: `BINANCE:${INITIAL_SYMBOL_LOAD_SLASH}` })
          setSelectedSymbolDetail(symbolDetails[`BINANCE:${INITIAL_SYMBOL_LOAD_SLASH}`])
        }
        break
      }
      case 'ftx': {
        const symbolValue = `FTX:${selectedSymbolDetail.base_asset}/${selectedSymbolDetail.quote_asset}`
        const details = symbolDetails[symbolValue]
        if (details) {
          localStorage.setItem('selectedSymbol', `${selectedSymbolDetail.base_asset}/${selectedSymbolDetail.quote_asset}`)
          setSelectedSymbol({ label: symbolLabel, value: symbolValue })
          setSelectedSymbolDetail(details)
        } else {
          localStorage.setItem('selectedSymbol', INITIAL_SYMBOL_LOAD_SLASH)
          setSelectedSymbol({ label: INITIAL_SYMBOL_LOAD_DASH, value: `FTX:${INITIAL_SYMBOL_LOAD_SLASH}` })
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
  }, [queryExchanges.data, queryExchanges.status, loadExchanges, activeExchange, totalExchanges])

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
      const response = await getUserExchanges();
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
        isLoading: queryExchanges.isLoading || !selectedSymbolDetail,
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
        ftxDD
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
