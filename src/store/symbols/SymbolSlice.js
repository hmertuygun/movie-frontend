import { createSlice } from '@reduxjs/toolkit'

const symbolSlice = createSlice({
  name: 'symbols',
  initialState: {
    symbols: [],
    symbolDetails: {},
    selectedSymbol: '',
    selectedSymbolDetail: {},
    selectedSymbolBalance: '',
    selectedBaseSymbolBalance: '',
    isLoadingBalance: false,
    selectedSymbolLastPrice: '',
    isLoadingLastPrice: false,
    symbolType: null,
  },
  reducers: {
    setSymbols: (state, action) => {
      state.symbols = action.payload
    },
    setSymbolDetails: (state, action) => {
      state.symbolDetails = action.payload
    },
    setSelectedSymbol: (state, action) => {
      state.selectedSymbol = action.payload
    },
    setSelectedSymbolDetail: (state, action) => {
      state.selectedSymbolDetail = action.payload
    },
    setSelectedSymbolBalance: (state, action) => {
      state.selectedSymbolBalance = action.payload
    },
    setSelectedBaseSymbolBalance: (state, action) => {
      state.selectedBaseSymbolBalance = action.payload
    },
    setIsLoadingBalance: (state, action) => {
      state.isLoadingBalance = action.payload
    },
    setSelectedSymbolLastPrice: (state, action) => {
      state.selectedSymbolLastPrice = action.payload
    },
    setIsLoadingLastPrice: (state, action) => {
      state.isLoadingLastPrice = action.payload
    },
    setSymbolType: (state, action) => {
      state.symbolType = action.payload
    },
  },
})

export default symbolSlice
