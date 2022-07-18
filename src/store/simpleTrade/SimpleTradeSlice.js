import { createSlice } from '@reduxjs/toolkit'

const simpleTradeSlice = createSlice({
  name: 'simpleTrade',
  initialState: {
    tradeState: {},
  },
  reducers: {
    setEntry: (state, action) => {
      const existingState = JSON.parse(JSON.stringify(state.tradeState))
      state.tradeState = { ...existingState, entry: action.payload }
    },
    setTargets: (state, action) => {
      const existingState = JSON.parse(JSON.stringify(state.tradeState))
      const existingTargets = existingState.targets || []
      state.tradeState = {
        ...existingState,
        targets: [...existingTargets, action.payload],
      }
    },
    removeTargets: (state, action) => {
      const { removeIndex } = action.payload
      const existingState = JSON.parse(JSON.stringify(state.tradeState))
      state.tradeState = {
        ...existingState,
        targets: [
          ...existingState.targets.filter(
            (target, targetIndex) => targetIndex !== removeIndex
          ),
        ],
      }
    },
    setStopLoss: (state, action) => {
      const existingState = JSON.parse(JSON.stringify(state.tradeState))
      const existingStoploss = existingState.stoploss || []
      state.tradeState = {
        ...existingState,
        stoploss: [...existingStoploss, action.payload],
      }
    },
    removeStopLoss: (state, action) => {
      const { removeIndex } = action.payload
      const existingState = JSON.parse(JSON.stringify(state.tradeState))
      state.tradeState = {
        ...existingState,
        stoploss: [
          ...existingState.stoploss.filter(
            (stoploss, stoplossIndex) => stoplossIndex !== removeIndex
          ),
        ],
      }
    },
    clearTradeState: (state) => {
      state.tradeState = {}
    },
  },
})

export default simpleTradeSlice
