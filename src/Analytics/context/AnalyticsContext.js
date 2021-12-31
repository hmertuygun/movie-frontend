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
import { errorNotification } from '../../components/Notifications'

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
      try {
        const analytics = await getAnalytics(payload)

        setPairOperations(analytics.pair_operations)
        setPairPerformance(analytics.pair_performance)
        setAssetPerformance(analytics.asset_performance)
      } catch (error) {
        console.log(error)
        // errorNotification.open({
        //   description: `Analytics could not fetched. Please try again later!`,
        // })
      }

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
  }, [user, activeExchange, isOnboardingSkipped])

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
