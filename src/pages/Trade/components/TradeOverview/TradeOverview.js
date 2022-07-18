import React from 'react'
import { Typography } from 'components'
import styles from './TradeOverview.module.css'
import { useSelector } from 'react-redux'
const TradeOverview = () => {
  const { selectedSymbol } = useSelector((state) => state.symbols)
  const { activeExchange } = useSelector((state) => state.exchanges)
  const { tradeState } = useSelector((state) => state.simpleTrade)
  if (!tradeState) {
    return null
  }

  return (
    <div className={styles['TradeOverview-container']}>
      <OverviewHeading>Trade Overview</OverviewHeading>

      <div className={styles['TradeOverview-row']}>
        <Typography>{selectedSymbol}</Typography>

        <Typography>Exchange: {activeExchange.label}</Typography>
      </div>

      <Typography>Amount: {tradeState.entry.quantity}</Typography>
      <Typography>Total: {tradeState.entry.price}</Typography>
    </div>
  )
}

export default TradeOverview

const OverviewHeading = ({ children }) => (
  <Typography as="h3" className={styles['TradeOverview-heading']}>
    {children}
  </Typography>
)
