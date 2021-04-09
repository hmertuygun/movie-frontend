import React from 'react'
import PriceAlerts from '../PriceAlerts/PriceAlerts'
import { SymbolContextProvider } from '../Trade/context/SymbolContext'

const PriceAlertView = () => {
  return (
    <SymbolContextProvider>
      <PriceAlerts />
    </SymbolContextProvider>
  )
}

export default PriceAlertView
