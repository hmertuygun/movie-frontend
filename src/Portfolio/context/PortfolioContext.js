import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
  useMemo,
} from 'react'
import axios from 'axios'
import { firebase } from '../../firebase/firebase'
import { UserContext } from '../../contexts/UserContext'
import ccxtpro from 'ccxt.pro'
import { ccxtConfigs } from '../../constants/ccxtConfigs'
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

  const loop = async (ccxt, symbol) => {
    while (true) {
      try {
        const message = await ccxt.watchTicker(symbol)

        setLastMessage((lastMessage) => {
          return { ...lastMessage, [message.symbol]: message }
        })
      } catch (error) {
        console.error(error)
        break
      }
    }
  }

  const refreshData = useCallback(async () => {
    try {
      setLoading(true)
      const apiUrl = `${process.env.REACT_APP_API_V2}getPortfolio?apiKeyName=${activeExchange.apiKeyName}&exchange=${activeExchange.exchange}`
      const token = await firebase.auth().currentUser.getIdToken()

      const exchanges = await axios(apiUrl, {
        headers: await getHeaders(token),
        method: 'GET',
      })

      const ccxt = new ccxtpro[activeExchange.exchange](
        ccxtConfigs[activeExchange.exchange]
      )

      try {
        exchanges.data.EstValue.forEach((element) => {
          if (element.symbol !== 'BTC') {
            if (ccxt.has['watchTicker']) {
              loop(ccxt, `BTC/${element.symbol}`)
            } else {
              console.log(
                `${activeExchange.exchange} doesn't support watchTicker`
              )
            }
          }
        })
        exchanges.data.BottomTable.forEach((element) => {
          if (element.SYMBOL !== 'BTC' && element.SYMBOL !== 'USDT') {
            if (ccxt.has['watchTicker']) {
              loop(ccxt, `${element.SYMBOL}/BTC`)
              loop(ccxt, `${element.SYMBOL}/USDT`)
            } else {
              console.log(
                `${activeExchange.exchange} doesn't support watchTicker`
              )
            }
          }
        })
      } catch (error) {
        console.error(error)
      }

      setTicker(exchanges.data)
      setBalance(exchanges.data.BottomTable)
      setChart(exchanges.data.Distribution)
      setEstimate(exchanges.data.EstValue)

      setLoading(false)
    } catch (error) {
      console.error(error)
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
