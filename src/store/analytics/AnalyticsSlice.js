import { createSlice } from '@reduxjs/toolkit'

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    pairOperations: null,
    pairPerformance: null,
    assetPerformance: null,
    analyticsLoading: false,
    loadingError: false,
  },
  reducers: {
    setPairOperations: (state, action) => {
      state.pairOperations = action.payload
    },
    setPairPerformance: (state, action) => {
      state.pairPerformance = action.payload
    },
    setAssetPerformance: (state, action) => {
      state.assetPerformance = action.payload
    },
    setAnalyticsLoading: (state, action) => {
      state.analyticsLoading = action.payload
    },
    setLoadingError: (state, action) => {
      state.loadingError = action.payload
    },
  },
})

export default analyticsSlice
