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
      const exisitngProducts = JSON.parse(JSON.stringify(state.products))
      state.products = [...exisitngProducts, action.payload]
    },
    clearProducts: (state) => {
      state.products = []
    },
  },
})

export default marketSlice
