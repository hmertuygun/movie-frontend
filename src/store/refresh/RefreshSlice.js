import { createSlice } from '@reduxjs/toolkit'

const refreshSlice = createSlice({
  name: 'refresh',
  initialState: {
    disableOrderHistoryRefreshBtn: false,
    disableOpenOrdersRefreshBtn: false,
    disablePortfolioRefreshBtn: false,
    disableAnalyticsRefreshBtn: false,
  },
  reducers: {
    setDisableOrderHistoryRefreshBtn: (state, action) => {
      state.disableOrderHistoryRefreshBtn = action.payload
    },
    setDisableOpenOrdesrRefreshBtn: (state, action) => {
      state.disableOpenOrdersRefreshBtn = action.payload
    },
    setDisablePortfolioRefreshBtn: (state, action) => {
      console.log('setDisablePortfolioRefreshBtn', action)
      state.disablePortfolioRefreshBtn = action.payload
    },
    setDisableAnalyticsRefreshBtn: (state, action) => {
      state.disableAnalyticsRefreshBtn = action.payload
    },
  },
})

export default refreshSlice
