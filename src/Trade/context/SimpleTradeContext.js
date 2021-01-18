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
    quantity,
    symbol,
    type = 'market',
    side = 'buy',
  }) => {
    setState({
      ...state,
      entry: {
        quantity,
        symbol,
        type,
        side,
      },
    })
  }

  const addTarget = ({
    price,
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
    price,
    quantity,
    profit,
    symbol,
    type = 'stopmarket',
    side = 'sell',
  }) => {
    const targets = state.targets || []
    const triggerPrice = price
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

  const addStoploss = ({
    price,
    triggerPrice,
    quantity,
    profit,
    symbol,
    side = 'sell',
    type = 'stoplimit',
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

  const addStoplossMarket = ({
    triggerPrice,
    quantity,
    profit,
    symbol,
    side = 'sell',
    type = 'stopmarket',
  }) => {
    const stoploss = state.stoploss || []

    setState({
      ...state,
      stoploss: [
        ...stoploss,
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
        removeEntry,
        addTarget,
        addStopMarketTarget,
        removeTarget,
        addStoploss,
        addStoplossMarket,
        removeStoploss,
        clear
      }}
    >
      {children}
    </TradeContext.Provider>
  )
}

export default SimpleTradeContextProvider
