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

  const refreshData = useCallback(
    async (skipCache = false) => {
      try {
        setLoading(true)
        const exchanges = await getPortfolio(
          activeExchange.apiKeyName,
          activeExchange.exchange,
          skipCache
        )
        const ccxt = ccxtClass[activeExchange.exchange]
        let message = {}
        try {
          let newData = await ccxt.fetchTickers()
          exchanges.data.EstValue.forEach((element) => {
            if (element.symbol !== 'BTC')
              message[`BTC/${element.symbol}`] =
                newData[`BTC/${element.symbol}`]
          })
          exchanges.data.BottomTable.forEach((element) => {
            if (element.SYMBOL !== 'BTC' && element.SYMBOL !== 'USDT') {
              message[`${element.SYMBOL}/BTC`] =
                newData[`${element.SYMBOL}/BTC`]
              message[`${element.SYMBOL}/USDT`] =
                newData[`${element.SYMBOL}/USDT`]
            }
          })
        } catch (error) {}
        const elapsedTime =
          exchanges.data.elapsed === '0 second'
            ? 'Now'
            : `${exchanges.data.elapsed} ago`

        setLastMessage(message)
        setTicker(exchanges.data)
        setBalance(exchanges.data.BottomTable)
        setChart(exchanges.data.Distribution)
        setEstimate(exchanges.data.EstValue)
        setElapsed(elapsedTime)
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
    ]
  )

  const fetchData = useCallback(async () => {
    if (user && activeExchange.exchange) {
      refreshData()
    }
  }, [activeExchange.exchange, refreshData, user])

  firebase.auth().onAuthStateChanged(function (user) {
    if (user != null) {
      setUser(user)
    } else {
      setUser(null)
    }
  })

  useEffect(() => {
    if (!isOnboardingSkipped) {
      fetchData()
    }
  }, [user, activeExchange, fetchData, isOnboardingSkipped])

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
        marketData,
        setMarketData,
        elapsed,
        lastMessage,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}

export default PortfolioCTXProvider
