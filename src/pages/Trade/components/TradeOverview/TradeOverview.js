import React, { useContext } from 'react'
import { TradeContext } from 'contexts/SimpleTradeContext'
import { useSymbolContext } from 'contexts/SymbolContext'
import { Typography } from 'components'
import styles from './TradeOverview.module.css'
import { UserContext } from 'contexts/UserContext'
const TradeOverview = () => {
  const { state } = useContext(TradeContext)
  const { selectedSymbol, selectedExchange } = useSymbolContext()
  const { activeExchange } = useContext(UserContext)
  if (!state) {
    return null
  }

  return (
    <div className={styles['TradeOverview-container']}>
      <OverviewHeading>Trade Overview</OverviewHeading>

      <div className={styles['TradeOverview-row']}>
        <Typography>{selectedSymbol}</Typography>

        <Typography>Exchange: {activeExchange.label}</Typography>
      </div>

      <Typography>Amount: {state.entry.quantity}</Typography>
      <Typography>Total: {state.entry.price}</Typography>
    </div>
  )
}

export default TradeOverview

const OverviewHeading = ({ children }) => (
  <Typography as="h3" className={styles['TradeOverview-heading']}>
    {children}
  </Typography>
)
