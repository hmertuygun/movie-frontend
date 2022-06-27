import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
  useMemo,
} from 'react'
import { firebase } from 'services/firebase'
import { UserContext } from 'contexts/UserContext'
import { useSymbolContext } from 'contexts/SymbolContext'
import { ccxtClass } from 'constants/ccxtConfigs'
import { useNotifications } from 'reapop'
import { useLocation } from 'react-router-dom'
import { getPortfolio } from 'services/api'

export const PortfolioContext = createContext()

const PortfolioCTXProvider = ({ children }) => {
  const { notify } = useNotifications()
  const { pathname } = useLocation()
  const { activeExchange, isOnboardingSkipped } = useContext(UserContext)
  const isPortfolioPage = useMemo(() => pathname.includes('/portfolio'), [])
  const [tickers, setTicker] = useState()
  const [chart, setChart] = useState()
  const [lastMessage, setLastMessage] = useState()
  const [estimate, setEstimate] = useState()
  const [balance, setBalance] = useState()
  const [loading, setLoading] = useState(false)
  const [error, setErrorLoading] = useState(false)
  const [elapsed, setElapsed] = useState(null)
  const [user, setUser] = useState()
  const [marketData, setMarketData] = useState([])
  const [selectedExchanges, setSelectedExchanges] = useState([])

  const refreshData = useCallback(
    async (skipCache = false) => {
      try {
        setLoading(true)
        const payload = { exchanges: [] }
        selectedExchanges.forEach((element) => {
          payload.exchanges.push([element.exchange, element.apiKeyName])
        })
        const portfolioData = await getPortfolio(payload, skipCache)

        if (portfolioData?.data?.elapsed) {
          const elapsedTime =
            portfolioData.data.elapsed === '0 second'
              ? 'Now'
              : `${portfolioData.data.elapsed} ago`
          setElapsed(elapsedTime)
        }

        setTicker(portfolioData.data)
        setBalance(portfolioData.data.BottomTable)
        setChart(portfolioData.data.Distribution)
        setEstimate(portfolioData.data.EstValue)
        setLoading(false)
      } catch (error) {
        console.log(error)
        if (isPortfolioPage) {
          notify({
            id: 'portfolio-fetch-error',
            status: 'error',
            title: 'Error',
            message: "Portfolio couldn't be created. Please try again later!",
          })
        }
        setBalance(null)
        setChart(null)
        setEstimate(null)

        setLoading(false)
        setErrorLoading(true)
      }
    },
    [
      activeExchange.apiKeyName,
      activeExchange.exchange,
      isPortfolioPage,
      notify,
      selectedExchanges,
    ]
  )

  const fetchData = useCallback(async () => {
    if (user && activeExchange.exchange && selectedExchanges.length) {
      refreshData()
    }
  }, [activeExchange.exchange, refreshData, user, selectedExchanges])

  firebase.auth().onAuthStateChanged(function (user) {
    if (user != null) {
      setUser(user)
    } else {
      setUser(null)
    }
  })

  useEffect(() => {
    if (!isOnboardingSkipped) {
      if (!selectedExchanges.length && activeExchange?.label)
        setSelectedExchanges([activeExchange])
      fetchData()
    }
  }, [user, activeExchange, fetchData, isOnboardingSkipped, selectedExchanges])

  return (
    <PortfolioContext.Provider
      value={{
        loading,
        balance,
        chart,
        estimate,
        tickers,
        refreshData,
        selectedExchanges,
        error,
        marketData,
        setMarketData,
        setSelectedExchanges,
        elapsed,
        lastMessage,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}

export default PortfolioCTXProvider
