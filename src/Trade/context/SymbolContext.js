import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useContext,
} from 'react'
import { getExchanges, getBalance, getLastPrice, getUserExchanges, updateLastSelectedAPIKey } from '../../api/api'
import { UserContext } from '../../contexts/UserContext'
import { errorNotification } from '../../components/Notifications'
import { useQuery } from 'react-query'

const SymbolContext = createContext()

const SymbolContextProvider = ({ children }) => {
  const { activeExchange, setActiveExchange, totalExchanges, loaderVisible, setLoaderVisibility } = useContext(UserContext)
  const [exchanges, setExchanges] = useState([])
  const [symbols, setSymbols] = useState([])
  const [symbolDetails, setSymbolDetails] = useState({})
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [selectedSymbolDetail, setSelectedSymbolDetail] = useState({})
  const [selectedExchange, setSelectedExchange] = useState('')
  const [selectedSymbolBalance, setSelectedSymbolBalance] = useState('')
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [selectedSymbolLastPrice, setSelectedSymbolLastPrice] = useState('')
  const [isLoadingLastPrice, setIsLoadingLastPrice] = useState(false)

  async function loadBalance(quote_asset, refresh = false) {
    setIsLoadingBalance(true)
    const cacheBalance = localStorage.getItem(
      `balance_${quote_asset}_${activeExchange.apiKeyName}_${activeExchange.exchange}`
    )
    if (cacheBalance) {
      setSelectedSymbolBalance(cacheBalance)
      if (!refresh) {
        setIsLoadingBalance(false)
      }
    }
    try {
      const response = await getBalance({
        symbol: quote_asset,
        ...activeExchange,
      })
      if ('balance' in response.data) {
        setSelectedSymbolBalance(response.data['balance'])
        localStorage.setItem(
          `balance_${quote_asset}_${activeExchange.apiKeyName}_${activeExchange.exchange}`,
          response.data['balance']
        )
      } else {
        console.log('no balance found for ' + quote_asset)
        setSelectedSymbolBalance(0)
      }
    } catch (err) {
      setSelectedSymbolBalance(0)
    }
    setIsLoadingBalance(false)
  }

  async function loadLastPrice(symbolpair) {
    setIsLoadingLastPrice(true)
    const cacheLastPrice = localStorage.getItem(`last_price_${symbolpair}`)
    if (cacheLastPrice) {
      setSelectedSymbolLastPrice(cacheLastPrice)
      setIsLoadingLastPrice(false)
    }
    try {
      const response = await getLastPrice(symbolpair)
      if (
        'last_price' in response.data &&
        response.data['last_price'] !== 'NA'
      ) {
        console.log('setting last price for ' + symbolpair)
        setSelectedSymbolLastPrice(response.data['last_price'])
        localStorage.setItem(
          `last_price_${symbolpair}`,
          response.data['last_price']
        )
      } else {
        console.log('no balance found for ' + symbolpair)
        setSelectedSymbolLastPrice(0)
      }
    } catch (Exception) {
      setSelectedSymbolLastPrice(0)
    }
    setIsLoadingLastPrice(false)
  }

  function setSymbol(symbol) {
    if (symbol == null || symbol === selectedSymbol) {
      return
    }
    console.log('setting symbol')
    setSelectedSymbol(symbol)
    setSelectedSymbolDetail(symbolDetails[symbol['value']])
    setSelectedSymbolBalance('')
    if (symbol['value'] in symbolDetails) {
      loadBalance(symbolDetails[symbol['value']]['quote_asset'])
      loadLastPrice(symbolDetails[symbol['value']]['symbolpair'])
    }
  }

  async function setExchange(exchange) {
    try {
      if (activeExchange.apiKeyName === exchange.apiKeyName && activeExchange.exchange === exchange.exchange) {
        return
      }
      setLoaderVisibility(true)
      await updateLastSelectedAPIKey({ ...exchange })
      // if user selects the selected option again in the dropdown
      setActiveExchange(exchange)
      sessionStorage.setItem('exchangeKey', JSON.stringify(exchange))
    }
    catch (e) {
      errorNotification.open({ description: `Error activating this exchange key!` })
    }
    finally {
    }
  }

  const queryExchanges = useQuery('exchangeSymbols', getExchanges)

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
        let mapExchanges = totalExchanges.map((item) => ({ ...item, label: `${item.exchange} - ${item.apiKeyName}`, value: `${item.exchange} - ${item.apiKeyName}` }))
        setExchanges(mapExchanges)
        setSymbols(symbolList)
        setSymbolDetails(symbolDetails)
        setSelectedSymbol({ label: 'BTC-USDT', value: 'BINANCE:BTCUSDT' })
        setSelectedSymbolDetail(symbolDetails['BINANCE:BTCUSDT'])
        loadBalance('USDT')
        loadLastPrice('BTCUSDT')
      } else {
        setExchanges([])
        setSymbols([])
      }
    } catch (error) {
      console.error(error)
    }
  }, [queryExchanges.data, queryExchanges.status])

  useEffect(() => {
    refreshBalance()
  }, [activeExchange])

  useEffect(() => {
    loadExchanges()
  }, [queryExchanges.status, loadExchanges, totalExchanges])

  const refreshBalance = () => {
    if (selectedSymbolDetail?.quote_asset) {
      loadBalance(selectedSymbolDetail.quote_asset, true)
    }
  }

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
        isLoadingBalance,
        selectedSymbolLastPrice,
        refreshBalance,
        isLoadingBalance,
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
