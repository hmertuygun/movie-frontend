import React, { createContext, useReducer, useContext } from 'react'

const TradeStateContext = createContext()
const TradeDispatchContext = createContext()

const ACTIONS = {
  ENTRY: 'ENTRY',
}

async function tradeReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ENTRY: {
      console.log(action)

      return {
        ...state,
        entry: action.payload,
      }
    }
    default: {
      throw new Error('Unhandled action type: ' + action.type)
    }
  }
}

const TradeContext = ({ children }) => {
  const [state, dispatch] = useReducer(tradeReducer, {
    entry: {},
    exits: [],
    targets: [],
  })

  return (
    <TradeStateContext.Provider value={state}>
      <TradeDispatchContext.Provider value={dispatch}>
        {children}
      </TradeDispatchContext.Provider>
    </TradeStateContext.Provider>
  )
}

const useTradeContext = () => {
  const context = useContext(TradeStateContext)

  if (context === undefined) {
    throw new Error('useEntry must be used within a TradeContextProvider')
  }

  return context
}

const useTradeDispatch = () => {
  const context = useContext(TradeDispatchContext)

  if (context === undefined) {
    throw new Error('useEntry must be used within a TradeContextProvider')
  }

  return context
}

function useTrade() {
  return [useTradeContext, useTradeDispatch]
}

// the hooks
export { ACTIONS, useTrade, useTradeContext, useTradeDispatch }

// the parent Component that enables context in the children
export default TradeContext
