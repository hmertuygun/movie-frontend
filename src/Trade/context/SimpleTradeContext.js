import React, { createContext, useState } from 'react'

export const TradeContext = createContext()

const testState = {
  entry: {
    price: 18000,
    amount: 0.044,
  },
  targets: [],
  exits: [],
}

const SimpleTradeContextProvider = ({ children }) => {
  // console.warn('USING TEST STATE')
  // console.warn({ state: testState })

  const [state, setState] = useState(testState)

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
    console.log(state)
    setState({
      ...state,
      targets: [...state.targets, { price, amount }],
    })
  }

  const addStoploss = ({ price, triggerPrice, amount }) => {
    setState({
      ...state,
      exits: [
        ...state.exits,
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
