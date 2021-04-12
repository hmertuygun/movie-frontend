import React, { createContext, useState, useEffect, useContext } from 'react'
import * as Sentry from '@sentry/browser'
import { UserContext } from '../../contexts/UserContext'
import { getPositionsList } from '../../api/api'
import { errorNotification } from '../../components/Notifications'

export const PositionContext = createContext()

const PositionCTXProvider = ({ children }) => {
  const { activeExchange } = useContext(UserContext)
  const { exchange, apiKeyName } = activeExchange

  const [isLoading, setIsLoading] = useState(false)
  const [positions, setPositions] = useState([])

  const fetchPositionsList = async () => {
    try {
      setIsLoading(true)
      const { data } = await getPositionsList({ exchange, apiKeyName })
      console.log("positions: ", data.positions)
      setPositions(data.positions)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      errorNotification.open({
        description: 'Cannot fetch positions. Please try again later!',
      })
      Sentry.captureException(error)
      throw new Error('Cannot fetch positions')
    }
  }

  useEffect(() => {
    if (exchange && apiKeyName) {
      fetchPositionsList()
    }
  }, [activeExchange])

  const refreshData = () => {
    fetchPositionsList()
  }

  return (
    <PositionContext.Provider value={{ isLoading, positions, refreshData }}>
      {children}
    </PositionContext.Provider>
  )
}

export default PositionCTXProvider
