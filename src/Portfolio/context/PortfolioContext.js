import React, { useState, useEffect, useContext, createContext } from 'react'
import { useQuery } from 'react-query'
import { UserContext } from '../../contexts/UserContext'
import { getPortfolioFS } from '../../api/api'

export const PortfolioContext = createContext()

const PortfolioCTXProvider = ({ children }) => {
  let tickers = [],
    balance = [],
    chart = [],
    estimate = [],
    error = false

  const [loading, setLoading] = useState(false)

  const { activeExchange } = useContext(UserContext)

  const portfolioQuery = useQuery(['portfolio', activeExchange], () =>
    getPortfolioFS(activeExchange)
  )

  if (portfolioQuery.data) {
    tickers = portfolioQuery.data
    balance = portfolioQuery.data.BottomTable
    chart = portfolioQuery.data.Distribution
    estimate = portfolioQuery.data.EstValue
  } else {
    error = true
  }

  const refreshData = async () => {
    setLoading(true)
    await portfolioQuery.refetch()
    setLoading(false)
  }

  useEffect(() => {
    portfolioQuery.refetch()
  }, [activeExchange])

  useEffect(() => {
    setLoading(portfolioQuery.isLoading)
  }, [portfolioQuery.isLoading])

  return (
    <PortfolioContext.Provider
      value={{
        loading,
        balance,
        chart,
        estimate,
        tickers,
        refreshData,
        error,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}

export default PortfolioCTXProvider
