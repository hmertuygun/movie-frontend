import React, { createContext, useState } from 'react'

export const TradeContext = createContext()

const initialState = {}

const SimpleTradeContextProvider = ({ children }) => {
  const [state, setState] = useState(initialState)

  const addEntry = ({
    price,
    quantity,
    type = 'limit',
    side = 'buy',
    symbol = 'BTCUSDT',
  }) => {
    setState({
      ...state,
      entry: {
        price,
        quantity,
        type,
        symbol,
        side,
      },
    })
  }

  const addTarget = ({
    price,
    quantity,
    profit,
    symbol = 'BTCUSDT',
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
          quantity,
          profit,
          symbol,
          type,
          side,
        },
      ],
    })
  }

  const addStoploss = ({
    price,
    triggerPrice,
    quantity,
    profit,
    side = 'sell',
    type = 'limit',
    symbol = 'BTCUSDT',
  }) => {
    const stoploss = state.stoploss || []

    setState({
      ...state,
      stoploss: [
        ...stoploss,
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

  return (
    <TradeContext.Provider
      value={{
        state,
        addEntry,
        removeEntry,
        addTarget,
        removeTarget,
        addStoploss,
        removeStoploss,
      }}
    >
      {children}
    </TradeContext.Provider>
  )
}

export default SimpleTradeContextProvider
