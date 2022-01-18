import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from 'react'
import axios from 'axios'
import { firebase } from '../../firebase/firebase'
import { UserContext } from '../../contexts/UserContext'
import { ccxtClass } from '../../constants/ccxtConfigs'
import { useNotifications } from 'reapop'
import { useLocation } from 'react-router-dom'

async function getHeaders(token) {
  return {
    'Content-Type': 'application/json;charset=UTF-8',
    Authorization: `Bearer ${token}`,
    'Access-Control-Allow-Methods':
      'GET, POST, PUT, PATCH, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export const PortfolioContext = createContext()

const PortfolioCTXProvider = ({ children }) => {
  const { notify } = useNotifications()
  const { pathname } = useLocation()
  const isPortfolioPage = pathname === '/portfolio'

  const [tickers, setTicker] = useState()
  const [chart, setChart] = useState()
  const [lastMessage, setLastMessage] = useState()
  const [estimate, setEstimate] = useState()
  const [balance, setBalance] = useState()
  const [loading, setLoading] = useState(false)
  const [error, setErrorLoading] = useState(false)
  const [user, setUser] = useState()
  const { activeExchange, isOnboardingSkipped } = useContext(UserContext)
  const [marketData, setMarketData] = useState([])

  const refreshData = useCallback(async () => {
    try {
      setLoading(true)
      const apiUrl = `${process.env.REACT_APP_PORTFOLIO_API}balance?api_key=${activeExchange.apiKeyName}&exchange=${activeExchange.exchange}`
      const token = await firebase.auth().currentUser.getIdToken()

      const exchanges = await axios(apiUrl, {
        headers: await getHeaders(token),
        method: 'GET',
      })
      const ccxt = ccxtClass[activeExchange.exchange]
      let message = {}
      try {
        let newData = await ccxt.fetchTickers()
        exchanges.data.EstValue.forEach((element) => {
          if (element.symbol !== 'BTC')
            message[`BTC/${element.symbol}`] = newData[`BTC/${element.symbol}`]
        })
        exchanges.data.BottomTable.forEach((element) => {
          if (element.SYMBOL !== 'BTC' && element.SYMBOL !== 'USDT') {
            message[`${element.SYMBOL}/BTC`] = newData[`${element.SYMBOL}/BTC`]
            message[`${element.SYMBOL}/USDT`] =
              newData[`${element.SYMBOL}/USDT`]
          }
        })
      } catch (error) {}
      setLastMessage(message)
      setTicker(exchanges.data)
      setBalance(exchanges.data.BottomTable)
      setChart(exchanges.data.Distribution)
      setEstimate(exchanges.data.EstValue)

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
  }, [
    activeExchange.apiKeyName,
    activeExchange.exchange,
    isPortfolioPage,
    notify,
  ])

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
        lastMessage,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}

export default PortfolioCTXProvider
