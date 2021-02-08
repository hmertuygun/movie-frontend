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
    let total_quantity = 0
    if (state.targets) {
      for (let i = 0; i < state.targets.length; i++) {
        total_quantity = total_quantity + state.targets[i]['quantity']
      }

      if (total_quantity + quantity >= state.entry.quantity) {
        return
      }
    }

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
    type = 'stop-market',
    side = 'sell',
  }) => {
    let total_quantity = 0
    if (state.targets) {
      for (let i = 0; i < state.targets.length; i++) {
        total_quantity = total_quantity + state.targets[i]['quantity']
      }

      if (total_quantity + quantity >= state.entry.quantity) {
        return
      }
    }
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
