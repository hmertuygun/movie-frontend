import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from 'react'
import { firebase } from '../../firebase/firebase'
import { UserContext } from '../../contexts/UserContext'
import { getAnalytics } from '../../api/api'
import { ccxtClass } from '../../constants/ccxtConfigs'
import axios from 'axios'

export const AnalyticsContext = createContext()

const AnalyticsProvider = ({ children }) => {
  const [pairOperations, setPairOperations] = useState()
  const [pairPerformance, setPairPerformance] = useState()
  const [assetPerformance, setAssetPerformance] = useState()
  const [loading, setLoading] = useState(false)
  const [error, setErrorLoading] = useState(false)
  const [user, setUser] = useState()
  const { activeExchange, isOnboardingSkipped } = useContext(UserContext)

  const refreshData = async ({ startDate, endDate, skipCache }) => {
    try {
      setLoading(true)
      const payload = {
        apiKeyName: activeExchange.apiKeyName,
        exchange: activeExchange.exchange,
      }
      if (startDate) payload.startDate = startDate
      if (endDate) payload.endDate = endDate
      if (skipCache) payload.skipCache = skipCache

      const analytics = await getAnalytics(payload)
      let tickers = {}
      if (activeExchange.exchange !== 'bybit') {
        tickers = await ccxtClass[activeExchange.exchange].fetchTickers()
      } else {
        const {
          data: { result },
        } = await axios.get(
          `${localStorage.getItem(
            'proxyServer'
          )}https://api.bybit.com/spot/quote/v1/ticker/24hr`
        )
        result.forEach((element) => {
          tickers[element.symbol] = { last: element.lastPrice }
        })
      }
      setPairOperations(() => {
        let final = analytics.pair_operations.map((element) => {
          const foundElement =
            activeExchange.exchange === 'bybit'
              ? tickers[element?.symbol.replace('-', '')]
              : tickers[element?.symbol.replace('-', '/')]
          const position =
            element.side === 'buy'
              ? (100 * foundElement.last) / element['avg. price'] - 100
              : (100 * element['avg. price']) / foundElement.last - 100
          if (tickers && foundElement) {
            return {
              ...element,
              currentPrice: foundElement.last,
              position,
            }
          }
          return element
        })
        return final
      })

      setPairPerformance(analytics.pair_performance)
      setAssetPerformance(analytics.asset_performance)

      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
      setErrorLoading(true)
    }
  }

  const fetchData = useCallback(async () => {
    if (user && activeExchange.exchange) {
      refreshData({})
    }
  }, [user, activeExchange.exchange])

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
    <AnalyticsContext.Provider
      value={{
        loading,
        pairOperations,
        pairPerformance,
        assetPerformance,
        refreshData,
        error,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  )
}

export default AnalyticsProvider
