import React, { createContext, useState } from 'react'

export const TradeContext = createContext()

const initialState = {}

const SimpleTradeContextProvider = ({ children }) => {
  const [state, setState] = useState(initialState)

  const addEntry = ({
    price,
    quantity,
    symbol,
    type = 'limit',
    side = 'buy',
  }) => {
    setState({
      ...state,
      entry: {
        price,
        quantity,
        symbol,
        type,
        side,
      },
    })
  }

  const addMarketEntry = ({
    price,
    quantity,
    symbol,
    type = 'market',
    side = 'buy',
  }) => {
    setState({
      ...state,
      entry: {
        price,
        quantity,
        symbol,
        type,
        side,
      },
    })
  }

  const addEntryStopLimit = ({
    trigger,
    price,
    quantity,
    symbol,
    type = 'stop-limit',
    side = 'buy',
  }) => {
    setState({
      ...state,
      entry: {
        trigger,
        price,
        quantity,
        symbol,
        type,
        side,
      },
    })
  }

  const addEntryStopMarket = ({
    trigger,
    quantity,
    symbol,
    type = 'stop-market',
    side = 'buy',
  }) => {
    setState({
      ...state,
      entry: {
        trigger,
        quantity,
        symbol,
        type,
        side,
      },
    })
  }

  const addTarget = ({
    price,
    triggerPrice,
    quantity,
    profit,
    symbol,
    type = 'limit',
    side = 'sell',
  }) => {
    const targets = state.targets || []
    setState({
      ...state,
      targets: [
        ...targets,
        {
          price,
          triggerPrice,
          quantity,
          profit,
          symbol,
          type,
          side,
        },
      ],
    })
  }

  const addStopMarketTarget = ({
    triggerPrice,
    quantity,
    profit,
    symbol,
    type = 'stop-market',
    side = 'sell',
  }) => {
    const targets = state.targets || []
    setState({
      ...state,
      targets: [
        ...targets,
        {
          triggerPrice,
          quantity,
          profit,
          symbol,
          type,
          side,
        },
      ],
    })
  }

  const addStoplossLimit = ({
    price,
    triggerPrice,
    quantity,
    profit,
    symbol,
    side = 'sell',
    type = 'stop-limit',
  }) => {
    setState({
      ...state,
      stoploss: [
        {
          price,
          profit,
          triggerPrice,
          quantity,
          side,
          type,
          symbol,
        },
      ],
    })
  }

  const addStoplossMarket = ({
    triggerPrice,
    quantity,
    profit,
    symbol,
    side = 'sell',
    type = 'stop-market',
  }) => {
    setState({
      ...state,
      stoploss: [
        {
          profit,
          triggerPrice,
          quantity,
          side,
          type,
          symbol,
        },
      ],
    })
  }

  const removeStoploss = (removeIndex) => {
    setState({
      ...state,
      stoploss: [
        ...state.stoploss.filter(
          (stoploss, stoplossIndex) => stoplossIndex !== removeIndex
        ),
      ],
    })
  }

  const removeTarget = (removeIndex) => {
    setState({
      ...state,
      targets: [
        ...state.targets.filter(
          // return all the targets where they are not removeIndex
          (target, targetIndex) => targetIndex !== removeIndex
        ),
      ],
    })
  }

  const removeEntry = () => {
    setState({
      state: initialState,
    })
  }

  const clear = () => {
    setState({
      state: initialState,
    })
  }

  return (
    <TradeContext.Provider
      value={{
        state,
        addEntry,
        addMarketEntry,
        addEntryStopLimit,
        addEntryStopMarket,
        removeEntry,
        addTarget,
        addStopMarketTarget,
        removeTarget,
        addStoplossLimit,
        addStoplossMarket,
        removeStoploss,
        clear,
      }}
    >
      {children}
    </TradeContext.Provider>
  )
}

export default SimpleTradeContextProvider
