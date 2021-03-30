import React, { createContext, useState, useEffect, useContext } from 'react'
import { UserContext } from '../../contexts/UserContext'
import { getPositionsList } from '../../api/api'

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
      if (data?.status === 'error') {
        console.log(
          data?.error || 'Cannot fetch positions. Please try again later!'
        )
      } else {
        setPositions(data.positions)
        setIsLoading(false)
      }
    } catch (error) {
      setIsLoading(false)
      console.log('Cannot fetch positions. Please try again later!')
    }
  }

  useEffect(() => {
    if (exchange && apiKeyName) fetchPositionsList()
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
