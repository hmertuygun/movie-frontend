import React, { useState, useContext, useEffect } from 'react'
import { useCallback } from 'react'

const BASE_URL = 'https://api.cryptonator.com/api/full/'

const EstimatedContext = React.createContext()

const EstimatedProvider = ({ children }) => {
  const [tickers, setTicker] = useState([])

  const fetchCrypto = useCallback(async (conversion) => {
    try {
      const response = await fetch(`${BASE_URL}${conversion}`)
      const data = await response.json()

      if (data.ticker.markets) {
        const newTicker = data.ticker.markets.map((item) => {
          const { market, price, volume } = item

          return {
            market,
            price,
            volume,
          }
        })

        setTicker(newTicker)
      } else {
        setTicker([])
      }
    } catch (error) {
      console.error(error)
    }
  }, [])
  useEffect(() => {
    fetchCrypto('btc-usd')
  }, [fetchCrypto])
  return (
    <EstimatedContext.Provider value={{ tickers }}>
      {children}
    </EstimatedContext.Provider>
  )
}

export const useGlobalContext = () => {
  return useContext(EstimatedContext)
}

export { EstimatedContext, EstimatedProvider }
