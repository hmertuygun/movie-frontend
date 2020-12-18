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
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [selectedExchange, setSelectedExchange] = useState('')

  function setSymbol(symbol) {
    setSelectedSymbol(symbol)
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

      if (queryExchanges.status === 'success' && data['exchanges']) {
        data['exchanges'].forEach((exchange) => {
          exchangeList.push(exchange['exchange'])
          exchange['symbols'].forEach((symbol) => {
            symbolList.push(exchange['exchange'].toUpperCase() + ':' + symbol)
          })
        })

        setExchanges(exchangeList)
        setSymbols(symbolList)
        setSelectedExchange(exchangeList[0])
        setSelectedSymbol('BINANCE:BTCEUR')
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
