import { createSlice } from '@reduxjs/toolkit'

const marketSlice = createSlice({
  name: 'market',
  initialState: {
    marketData: {},
    showMarketItems: false,
    watchListOpen: false,
    products: [],
  },
  reducers: {
    setMarketData: (state, action) => {
      state.marketData = action.payload
    },
    setShowMarketItems: (state, action) => {
      state.showMarketItems = action.payload
    },
    setWatchListOpen: (state, action) => {
      state.watchListOpen = action.payload
    },
    setProducts: (state, action) => {
      state.products = action.payload
    },
    clearProducts: (state) => {
      state.products = []
    },
  },
})

export const {
  setMarketData,
  setShowMarketItems,
  setWatchListOpen,
  setProducts,
  clearProducts,
} = marketSlice.actions

export default marketSlice.reducer
