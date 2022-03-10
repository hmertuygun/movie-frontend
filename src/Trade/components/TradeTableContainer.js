import React, { useContext } from 'react'
import { TradeContext } from '../context/SimpleTradeContext'
import Table from './Table/Table'
import { TRADE_TABLE_LABELS } from '../../constants/Trade'

const TradeTableContainer = ({ sell }) => {
  const { state } = useContext(TradeContext)
  const { entry, targets, stoploss } = state

  if (entry && entry.quantity > 0) {
    return (
      <Table
        labels={TRADE_TABLE_LABELS}
        entry={entry}
        targets={targets}
        stoploss={stoploss}
        sell={sell}
      />
    )
  } else {
    return null
  }
}

export default TradeTableContainer
