import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useContext,
} from 'react'
import { getExchanges, getBalance, getLastPrice } from '../../api/api'
import { useQuery } from 'react-query'

const SymbolContext = createContext()

const SymbolContextProvider = ({ children }) => {
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

  async function loadBalance(quote_asset) {
    try {
      setIsLoadingBalance(true)
      const response = await getBalance(quote_asset)
      if ('balance' in response.data) {
        setSelectedSymbolBalance(response.data['balance'])
      } else {
        console.log('no balance found for ' + quote_asset)
        setSelectedSymbolBalance(0)
      }
    } catch (Exception) {
      setSelectedSymbolBalance(0)
    }
    setIsLoadingBalance(false)
  }

  async function loadLastPrice(symbolpair) {
    try {
      setIsLoadingLastPrice(true)
      const response = await getLastPrice(symbolpair)
      if ('last_price' in response.data && response.data['last_price'] != 'NA') {
        console.log('setting last price for ' + symbolpair)
        setSelectedSymbolLastPrice(response.data['last_price'])
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

  function setExchange(exchange) {
    setSelectedExchange(exchange)
  }

  const queryExchanges = useQuery('exchangeSymbols', getExchanges)

  const loadExchanges = useCallback(async () => {
    try {
      const data = queryExchanges.data //await getExchanges()
      const exchangeList = []
      const symbolList = []
      const symbolDetails = {}

      if (queryExchanges.status === 'success' && data['exchanges']) {
        data['exchanges'].forEach((exchange) => {
          exchangeList.push(exchange['exchange'])
          exchange['symbols'].forEach((symbol) => {
            const value =
              exchange['exchange'].toUpperCase() + ':' + symbol['value']
            symbolList.push({
              label: symbol['label'],
              value: value,
            })
            let tickSize = symbol['tickSize']
            for (let i = 1; i < 10; i++) {
              tickSize = tickSize * 10
              if (tickSize == 1) {
                tickSize = i
                break
              }
            }

            let lotSize = symbol['stepSize']
            for (let i = 1; i < 10; i++) {
              lotSize = lotSize * 10
              if (lotSize == 1) {
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
              lotSize: lotSize
            }
          })
        })

        setExchanges(exchangeList)
        setSymbols(symbolList)
        setSymbolDetails(symbolDetails)
        setSelectedExchange({ label: 'Binance', value: exchangeList[0] })
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
    loadExchanges()
  }, [queryExchanges.status, loadExchanges])

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
        selectedSymbolLastPrice
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
