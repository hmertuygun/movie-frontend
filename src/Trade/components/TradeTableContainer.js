import React, { useContext } from 'react'
import { TradeContext } from '../context/SimpleTradeContext'
import Table from './Table/Table'

const TradeTableContainer = () => {
  const { state } = useContext(TradeContext)
  const { entry, targets, stoploss } = state

  const labels = [
    { text: 'Type' },
    { text: 'Price' },
    { text: 'Profit' },
    { text: 'Amount' },
    { text: '' },
  ]

  if (entry && entry.quantity > 0) {
    return (
      <Table
        labels={labels}
        entry={entry}
        targets={targets}
        stoploss={stoploss}
      />
    )
  } else {
    return null
  }
}

export default TradeTableContainer
