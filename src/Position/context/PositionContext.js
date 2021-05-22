import React, { createContext, useState, useEffect, useContext } from 'react'
import * as Sentry from '@sentry/browser'
import { UserContext } from '../../contexts/UserContext'
import { getPositionsList } from '../../api/api'
import { errorNotification } from '../../components/Notifications'

export const PositionContext = createContext()

const PositionCTXProvider = ({ children }) => {
  const { activeExchange, userData } = useContext(UserContext)
  const { exchange, apiKeyName } = activeExchange

  const [isLoading, setIsLoading] = useState(false)
  const [positions, setPositions] = useState([])

  const fetchPositionsList = async () => {
    try {
      if (!userData) return
      setIsLoading(true)
      const { data } = await getPositionsList({ exchange, apiKeyName })
      if (data?.error) {
        errorNotification.open({
          description: 'Cannot fetch positions. Please try again later!',
        })
      }
      else if (data?.positions) {
        console.log("positions: ", data?.positions)
        setPositions(data.positions)
      }
    } catch (error) {
      errorNotification.open({
        description: 'Cannot fetch positions. Please try again later!',
      })
      Sentry.captureException(error)
      console.warn('Cannot fetch positions')
    }
    finally {
      setIsLoading(false)
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
    <PositionContext.Provider value={{ isLoading, setIsLoading, positions, refreshData }}>
      {children}
    </PositionContext.Provider>
  )
}

export default PositionCTXProvider
