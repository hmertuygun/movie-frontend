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

const SymbolContext = createContext()

const SymbolContextProvider = ({ children }) => {
  const {
    activeExchange,
    setActiveExchange,
    totalExchanges,
    loaderVisible,
    setLoaderVisibility,
  } = useContext(UserContext)
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
  const [liveUpdate, setLiveUpdate] = useState(true)
  const [socketLiveUpdate, setSocketLiveUpdate] = useState(true)
  const [pollingLiveUpdate, setPollingLiveUpdate] = useState(true)

  const [timer, setTimer] = useState(null)

  useEffect(() => {
    const rws = new ReconnectingWebSocket(
      'wss://stream.binance.com:9443/stream'
    )
    rws.addEventListener('open', () => {
      setLiveUpdate(true)
      rws.send(
        JSON.stringify({
          id: 1,
          method: 'SUBSCRIBE',
          params: ['!ticker@arr'],
        })
      )
    })

    rws.addEventListener('message', (lastMessage) => {
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
  }, [])

  useEffect(() => {
    if (!socketLiveUpdate) {
      const getFirstData = async () => {
        const data = await get24hrTickerPrice()
        setLastMessage(data)
      }
      getFirstData()
      setTimer(
        setInterval(async () => {
          try {
            const data = await get24hrTickerPrice()
            setPollingLiveUpdate(true)
            setLastMessage(data)
          } catch (error) {
            setPollingLiveUpdate(false)
            Sentry.captureException(error)
          }
        }, 5000)
      )
    }
    return () => {
      clearInterval(timer)
    }
  }, [socketLiveUpdate])

  async function loadBalance(quote_asset, base_asset) {
    try {
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
    console.log('setting symbol')
    setSelectedSymbol(symbol)
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
      const symbolDetails = {}
      if (queryExchanges.status === 'success' && data['exchanges']) {
        data['exchanges'].forEach((exchange) => {
          // exchangeList.push(exchange['exchange'])
          exchange['symbols'].forEach((symbol) => {
            const value =
              exchange['exchange'].toUpperCase() + ':' + symbol['value']
            symbolList.push({
              label: symbol['label'],
              value: value,
            })
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
              tickSize: tickSize,
              lotSize: lotSize,
            }
          })
        })
        // Set total user added exchanges in dropdown
        let mapExchanges = totalExchanges.map((item) => ({
          ...item,
          label: `${item.exchange} - ${item.apiKeyName}`,
          value: `${item.exchange} - ${item.apiKeyName}`,
        }))
        setExchanges(mapExchanges)
        setSymbols(symbolList)
        setSymbolDetails(symbolDetails)
        setSelectedSymbol({ label: 'BTC-USDT', value: 'FTX:BTC/USDT' })
        setSelectedSymbolDetail(symbolDetails['FTX:BTC/USDT'])
        loadBalance('USDT', 'BTC')
        loadLastPrice('BTCUSDT')
      } else {
        setExchanges([])
        setSymbols([])
      }
    } catch (error) {
      console.error(error)
    }
  }, [queryExchanges.data, queryExchanges.status])

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
    if (!exchange || !selectedSymbolDetail.base_asset) return

    const symbolLabel = `${selectedSymbolDetail.base_asset}-${selectedSymbolDetail.quote_asset}`
    switch (exchange) {
      case 'binance': {
        const symbolValue = `BINANCE:${selectedSymbolDetail.base_asset}/${selectedSymbolDetail.quote_asset}`
        const details = symbolDetails[symbolValue]
        if (details) {
          setSelectedSymbol({ label: symbolLabel, value: symbolValue })
        } else {
          setSelectedSymbol({ label: 'BTC-USDT', value: 'BINANCE:BTC/USDT' })
        }
        break
      }
      case 'ftx': {
        const symbolValue = `FTX:${selectedSymbolDetail.base_asset}/${selectedSymbolDetail.quote_asset}`
        const details = symbolDetails[symbolValue]
        if (details) {
          setSelectedSymbol({ label: symbolLabel, value: symbolValue })
        } else {
          setSelectedSymbol({ label: 'BTC-USDT', value: 'FTX:BTC/USDT' })
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
  }, [queryExchanges.status, loadExchanges, totalExchanges])

  return (
    <SymbolContext.Provider
      value={{
        isLoading: queryExchanges.isLoading || !selectedSymbolDetail,
        exchanges,
        setExchange,
        selectedExchange,
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
      }}
    >
      {children}
    </SymbolContext.Provider>
  )
}

export const useSymbolContext = () => {
  return useContext(SymbolContext)
}

export { SymbolContext, SymbolContextProvider }
