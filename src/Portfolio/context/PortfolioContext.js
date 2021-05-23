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
  const [estimate, setEstimate] = useState()
  const [balance, setBalance] = useState()
  const [loading, setLoading] = useState(false)
  const [error, setErrorLoading] = useState(false)
  const [user, setUser] = useState()
  const { activeExchange } = useContext(UserContext)
  const [marketData, setMarketData] = useState([])

  const fetchData = useCallback(async () => {
    if (user && activeExchange.exchange) {
      refreshData()
    }
  }, [user, activeExchange])

  const refreshData = async () => {
    try {
      setLoading(true)
      const apiUrl = `${process.env.REACT_APP_API_V2}getPortfolio?apiKeyName=${activeExchange.apiKeyName}&exchange=${activeExchange.exchange}`
      const token = await firebase.auth().currentUser.getIdToken()

      const exchanges = await axios(apiUrl, {
        headers: await getHeaders(token),
        method: 'GET',
      })

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
  }

  firebase.auth().onAuthStateChanged(function (user) {
    if (user != null) {
      setUser(user)
    } else {
      setUser(null)
    }
  })

  useEffect(() => {
    fetchData()
  }, [user, activeExchange, fetchData])

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
        setMarketData
      }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}

export default PortfolioCTXProvider
