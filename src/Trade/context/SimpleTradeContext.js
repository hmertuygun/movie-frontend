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

  const addTarget = ({ price, amount }) => {
    setState({
      ...state,
      targets: [...state.targets, { price, amount }],
    })
  }

  const addStoploss = ({ price, triggerPrice, amount }) => {
    setState({
      ...state,
      stoploss: [
        ...state.stoploss,
        {
          price,
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
