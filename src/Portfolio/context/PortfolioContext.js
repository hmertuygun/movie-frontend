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
import ccxtpro from 'ccxt.pro'
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
  const [binance, binanceus, kucoin] = [
    new ccxtpro.binance({
      enableRateLimit: true,
    }),
    new ccxtpro.binanceus({
      enableRateLimit: true,
    }),
    new ccxtpro.kucoin({
      proxy: localStorage.getItem('proxyServer'),
      enableRateLimit: true,
    }),
  ]

  const refreshData = useCallback(async () => {
    try {
      setLoading(true)
      const apiUrl = `${process.env.REACT_APP_API_V2}getPortfolio?apiKeyName=${activeExchange.apiKeyName}&exchange=${activeExchange.exchange}`
      const token = await firebase.auth().currentUser.getIdToken()

      const exchanges = await axios(apiUrl, {
        headers: await getHeaders(token),
        method: 'GET',
      })
      let message = {}
      if (activeExchange.exchange == 'binance') {
        try {
          let newData = await binance.fetchTickers()
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
      } else if (activeExchange.exchange == 'binanceus') {
        try {
          let newData = await binanceus.fetchTickers()
          exchanges.data.EstValue.forEach((element) => {
            message[`BTC/${element.symbol}`] = newData[`BTC/${element.symbol}`]
          })
        } catch (error) {}
      } else if (activeExchange.exchange == 'kucoin') {
        try {
          let newData = await kucoin.fetchTickers()
          exchanges.data.EstValue.forEach((element) => {
            message[`BTC/${element.symbol}`] = newData[`BTC/${element.symbol}`]
          })
        } catch (error) {}
      }
      setLastMessage(message)
      setTicker(exchanges.data)
      setBalance(exchanges.data.BottomTable)
      setChart(exchanges.data.Distribution)
      setEstimate(exchanges.data.EstValue)

      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
      setErrorLoading(true)
    }
  }, [activeExchange.apiKeyName, activeExchange.exchange])

  const fetchData = useCallback(async () => {
    if (user && activeExchange.exchange) {
      refreshData()
    }
  }, [user, activeExchange.exchange, refreshData])

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
