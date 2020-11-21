import React, { createContext, useReducer, useContext } from 'react'

const TradeContext = createContext()
const TradeDispatchContext = createContext()

const ACTIONS = {
  ENTRY: 'ENTRY',
}

function tradeReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ENTRY: {
      return { entry: action.payload }
    }
    default: {
      throw new Error('Unhandled action type: ' + action.type)
    }
  }
}

const Container = ({ children }) => {
  const [value, dispatch] = useReducer(tradeReducer, {})

  return (
    <TradeContext.Provider value={value}>
      <TradeDispatchContext.Provider value={dispatch}>
        {children}
      </TradeDispatchContext.Provider>
    </TradeContext.Provider>
  )
}

const useTrade = () => {
  const context = useContext(TradeContext)

  if (context === undefined) {
    throw new Error('useEntry must be used within a TradeContextProvider')
  }
}

// the parent Component that enables context in the children
export default Container

// the hooks
export { useTrade, ACTIONS }
