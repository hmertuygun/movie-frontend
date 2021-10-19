import React, {
  createContext,
  useCallback,
  useState,
  useEffect,
  useContext,
  useRef,
} from 'react'
import { useLocation } from 'react-router-dom'
import * as Sentry from '@sentry/browser'
import { UserContext } from '../../contexts/UserContext'
import { getPositionsList } from '../../api/api'
import { errorNotification } from '../../components/Notifications'
import ccxtpro from 'ccxt.pro'

export const PositionContext = createContext()

const PositionCTXProvider = ({ children }) => {
  const location = useLocation()
  const { activeExchange, userData, isLoggedIn, isOnboardingSkipped } =
    useContext(UserContext)
  const { exchange, apiKeyName } = activeExchange

  const [isLoading, setIsLoading] = useState(false)
  const [positions, setPositions] = useState([])
  const [lastMessage, setLastMessage] = useState({})
  const [liveUpdate, setLiveUpdate] = useState(true)
  const intervalRef = useRef()

  const fetchLastMessage = useCallback(async () => {
    try {
      const ccxt = new ccxtpro[exchange]({
        proxy: localStorage.getItem('proxyServer'),
      })
      const message = await ccxt.fetchTickers()
      setLiveUpdate(true)
      setLastMessage(message)
    } catch (error) {
      console.error(error)
      setLiveUpdate(false)
    } finally {
    }
  }, [exchange])

  const fetchPositionsList = useCallback(async () => {
    try {
      setIsLoading(true)
      await fetchLastMessage()
      const { data } = await getPositionsList({ exchange, apiKeyName })
      if (data?.error) {
        errorNotification.open({
          description: 'Cannot fetch positions. Please try again later!',
        })
      } else if (data?.positions) {
        setPositions(data.positions)
      }
    } catch (error) {
      errorNotification.open({
        description: 'Cannot fetch positions. Please try again later!',
      })
      Sentry.captureException(error)
      // console.warn(error)
    } finally {
      setIsLoading(false)
    }
  }, [apiKeyName, exchange, fetchLastMessage])

  useEffect(() => {
    if (location.pathname === '/positions' && positions.length > 0) {
      intervalRef.current = setInterval(() => {
        fetchLastMessage()
      }, 3000)
    }
    return () => {
      clearInterval(intervalRef.current)
    }
  }, [fetchLastMessage, location.pathname, positions.length])

  useEffect(() => {
    if (
      userData &&
      isLoggedIn &&
      exchange &&
      apiKeyName &&
      !isOnboardingSkipped
    ) {
      fetchPositionsList()
    }
  }, [
    activeExchange,
    apiKeyName,
    exchange,
    fetchPositionsList,
    isLoggedIn,
    isOnboardingSkipped,
    userData,
  ])

  const refreshData = () => {
    fetchPositionsList()
  }

  return (
    <PositionContext.Provider
      value={{
        isLoading,
        setIsLoading,
        positions,
        refreshData,
        lastMessage,
        liveUpdate,
      }}
    >
      {children}
    </PositionContext.Provider>
  )
}

export default PositionCTXProvider
