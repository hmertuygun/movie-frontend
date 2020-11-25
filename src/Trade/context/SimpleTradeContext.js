import React, { createContext, useState } from 'react'

export const TradeContext = createContext()

const SimpleTradeContextProvider = ({ children }) => {
  const [state, setState] = useState({
    entry: {},
    targets: [],
    stoploss: [],
  })

  const addEntry = ({ price, amount }) => {
    setState({
      ...state,
      entry: {
        price,
        amount,
      },
    })
  }

  const addTarget = ({ price, amount, profit }) => {
    setState({
      ...state,
      targets: [...state.targets, { price, amount, profit }],
    })
  }

  const addStoploss = ({ price, triggerPrice, amount, profit }) => {
    setState({
      ...state,
      stoploss: [
        ...state.stoploss,
        {
          price,
          profit,
          triggerPrice,
          amount,
        },
      ],
    })
  }

  return (
    <TradeContext.Provider
      value={{
        state,
        addEntry,
        addTarget,
        addStoploss,
      }}
    >
      {children}
    </TradeContext.Provider>
  )
}

export default SimpleTradeContextProvider
