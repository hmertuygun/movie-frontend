import { createSlice } from '@reduxjs/toolkit'

const apiKeysSlice = createSlice({
  name: 'apiKeys',
  initialState: {
    loadApiKeys: false,
    setLoadApiKeysError: false,
    isApiKeysLoading: false,
  },
  reducers: {
    setLoadApiKeys: (state, action) => {
      state.loadApiKeys = action.payload
    },
    setLoadApiKeysError: (state, action) => {
      state.loadApiKeysError = action.payload
    },
    setIsApiKeysLoading: (state, action) => {
      state.isApiKeysLoading = action.payload
    },
  },
})

export default apiKeysSlice
