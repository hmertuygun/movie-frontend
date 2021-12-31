import React, {
  createContext,
  useCallback,
  useState,
  useEffect,
  useContext,
} from 'react'
import { UserContext } from '../../contexts/UserContext'
import { getPositionsList } from '../../api/api'
import { errorNotification } from '../../components/Notifications'
import { ccxtClass } from '../../constants/ccxtConfigs'

export const PositionContext = createContext()

const PositionCTXProvider = ({ children }) => {
  const { activeExchange, userData, isLoggedIn, isOnboardingSkipped } =
    useContext(UserContext)
  const { exchange, apiKeyName } = activeExchange

  const [isLoading, setIsLoading] = useState(false)
  const [positions, setPositions] = useState([])
  const [lastMessage, setLastMessage] = useState({})

  const fetchPositionsList = useCallback(async () => {
    try {
      setIsLoading(true)
      const ccxt = ccxtClass[exchange]
      const message = await ccxt.fetchTickers()
      setLastMessage(message)
      const { data } = await getPositionsList({ exchange, apiKeyName })
      if (data?.error) {
        // errorNotification.open({
        //   description: 'Cannot fetch positions. Please try again later!',
        // })
        console.log(data.error)
      } else if (data?.positions) {
        setPositions(data.positions)
      }
    } catch (error) {
      // errorNotification.open({
      //   description: 'Cannot fetch positions. Please try again later!',
      // })
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }, [apiKeyName, exchange])

  useEffect(() => {
    if (
      userData &&
      isLoggedIn &&
      exchange &&
      apiKeyName &&
      !isOnboardingSkipped
    ) {
      //fetchPositionsList()
    }
  }, [
    activeExchange,
    apiKeyName,
    exchange,
    fetchPositionsList,
    isLoggedIn,
    userData,
  ])

  const refreshData = () => {
    // fetchPositionsList()
  }

  return (
    <PositionContext.Provider
      value={{ isLoading, setIsLoading, positions, refreshData, lastMessage }}
    >
      {children}
    </PositionContext.Provider>
  )
}

export default PositionCTXProvider
