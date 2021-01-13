import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useContext,
} from 'react'
import { getExchanges, getBalance } from '../../api/api'
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

  async function loadBalance(quote_asset) {
    try {
      const response = await getBalance(quote_asset)
      if ('balance' in response.data) {
        setSelectedSymbolBalance(response.data["balance"])
      } else {
        setSelectedSymbolBalance(0)
      }
    } catch (Exception) {
      setSelectedSymbolBalance(0)
    }
  }

  function setSymbol(symbol) {
    setSelectedSymbol(symbol)
    setSelectedSymbolDetail(symbolDetails[symbol])
    setSelectedSymbolBalance('')
    if (symbol in symbolDetails) {
      loadBalance(symbolDetails[symbol]['quote_asset']) }
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
            const value = exchange['exchange'].toUpperCase() + ':' + symbol['value']
            symbolList.push(
                {
                    "label": symbol['label'],
                    "value": value
                })
            symbolDetails[value] = {
                'symbolpair': symbol['value'],
                'base_asset': symbol['base_asset'],
                'quote_asset': symbol['quote_asset'],
                'base_asset_precision': symbol['base_asset_precision'],
                'quote_asset_precision': symbol['quote_asset_precision']
            }
          })
        })

        setExchanges(exchangeList)
        setSymbols(symbolList)
        setSymbolDetails(symbolDetails)
        setSelectedExchange(exchangeList[0])
        setSelectedSymbol('BINANCE:BTCUSDT')
        setSelectedSymbolDetail(symbolDetails['BINANCE:BTCUSDT'])
        loadBalance('USDT')
        
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
        selectedSymbolBalance
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
