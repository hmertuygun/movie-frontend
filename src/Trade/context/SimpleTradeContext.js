import React, { createContext, useState } from 'react'

export const TradeContext = createContext()

const initialState = {}

const SimpleTradeContextProvider = ({ children }) => {
  const [state, setState] = useState(initialState)

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
    const targets = state.targets || []

    setState({
      ...state,
      targets: [...targets, { price, amount, profit }],
    })
  }

  const addStoploss = ({ price, triggerPrice, amount, profit }) => {
    const stoploss = state.stoploss || []

    setState({
      ...state,
      stoploss: [
        ...stoploss,
        {
          price,
          profit,
          triggerPrice,
          amount,
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
