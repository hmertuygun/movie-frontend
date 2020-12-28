import React, { useContext } from 'react'
import { TradeContext } from '../../context/SimpleTradeContext'
import { useSymbolContext } from '../../context/SymbolContext'
import { Typography } from '../../../components'
import styles from './TradeOverview.module.css'

const TradeOverview = () => {
  const { state } = useContext(TradeContext)
  const { selectedSymbol, selectedExchange } = useSymbolContext()

  console.log({ TradeState: state })

  return (
    <div className={styles['TradeOverview-container']}>
      <OverviewHeading>Trade Overview</OverviewHeading>

      <div className={styles['TradeOverview-row']}>
        <Typography>{selectedSymbol}</Typography>

        <Typography>Exchange: {selectedExchange}</Typography>
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
