import { createSlice } from '@reduxjs/toolkit'

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState: {
    tickers: null,
    lastMessage: null,
    estimate: null,
    balance: 0,
    portfolioLoading: false,
    loadingError: false,
    elapsed: null,
    marketData: [],
    selectedExchanges: [],
  },
  reducers: {
    setTickers: (state, action) => {
      state.tickers = action.payload
    },
    setLastMessage: (state, action) => {
      state.lastMessage = action.payload
    },
    setEstimate: (state, action) => {
      state.estimate = action.payload
    },
    setBalance: (state, action) => {
      state.balance = action.payload
    },
    setPortfolioLoading: (state, action) => {
      state.portfolioLoading = action.payload
    },
    setLoadingError: (state, action) => {
      state.loadingError = action.payload
    },
    setElapsed: (state, action) => {
      state.elapsed = action.payload
    },
    setMarketData: (state, action) => {
      state.marketData = action.payload
    },
    setSelectedExchanges: (state, action) => {
      state.selectedExchanges = action.payload
    },
  },
})

export default portfolioSlice
