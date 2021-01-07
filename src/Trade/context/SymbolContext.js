import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useContext,
} from 'react'
import { getExchanges } from '../../api/api'
import { useQuery } from 'react-query'

const SymbolContext = createContext()

const SymbolContextProvider = ({ children }) => {
  const [exchanges, setExchanges] = useState([])
  const [symbols, setSymbols] = useState([])
  const [symbolDetails, setSymbolDetails] = useState({})
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [selectedSymbolDetail, setSelectedSymbolDetail] = useState({})
  const [selectedExchange, setSelectedExchange] = useState('')

  function setSymbol(symbol) {
    setSelectedSymbol(symbol)
    setSelectedSymbolDetail(symbolDetails[symbol])
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
            value = exchange['exchange'].toUpperCase() + ':' + symbol['value']
            symbolList.push(
                {
                    "label": symbol['label'],
                    "value": value
                })
            symbolDetails[value] = {
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
        setSelectedSymbol('BINANCE:BTCEUR')
        setSelectedSymbolDetail(symbolDetails['BINANCE:BTCEUR'])
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
        isLoading: queryExchanges.isLoading,
        exchanges,
        setExchange,
        selectedExchange,
        symbols,
        setSymbol,
        selectedSymbol,
        symbolDetails,
        selectedSymbolDetail
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
