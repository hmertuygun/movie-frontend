import React from 'react'

import Table from './Table/Table'
import { TRADE_TABLE_LABELS } from 'constants/Trade'
import { useSelector } from 'react-redux'

const TradeTableContainer = ({ sell }) => {
  const { tradeState } = useSelector((state) => state.simpleTrade)
  const { entry, targets, stoploss } = tradeState

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
