import { createSlice } from '@reduxjs/toolkit'

const exchangeSlice = createSlice({
  name: 'exchanges',
  initialState: {
    exchanges: [],
    isExchangeLoading: false,
    exchangeType: null,
    exchangeUpdated: false,
    activeDD: [],
    totalExchanges: [],
    activeExchange: {
      apiKeyName: '',
      exchange: '',
    },
    isException: false,
  },
  reducers: {
    setExchanges: (state, action) => {
      state.exchanges = action.payload
    },
    setIsExchangeLoading: (state, action) => {
      state.isExchangeLoading = action.payload
    },
    setExchangeType: (state, action) => {
      state.exchangeType = action.payload
    },
    setExchangeUpdated: (state, action) => {
      state.exchangeUpdated = action.payload
    },
    setActiveDD: (state, action) => {
      state.activeDD = action.payload
    },
    setTotalExchanges: (state, action) => {
      state.totalExchanges = action.payload
    },
    setActiveExchange: (state, action) => {
      state.activeExchange = action.payload
    },
    setIsException: (state, action) => {
      state.isException = action.payload
    },
  },
})

export default exchangeSlice
