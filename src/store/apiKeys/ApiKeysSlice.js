import { createSlice } from '@reduxjs/toolkit'

const apiKeysSlice = createSlice({
  name: 'apiKeys',
  initialState: {
    loadApiKeys: false,
    setLoadApiKeysError: false,
    isApiKeysLoading: false,
    need2FA: false,
    tokenExpiry: null,
    secretKey: '',
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
    setNeed2FA: (state, action) => {
      state.need2FA = action.payload
    },
    setTokenExpiry: (state, action) => {
      state.tokenExpiry = action.payload
    },
    setSecretKey: (state, action) => {
      state.secretKey = action.payload
    },
  },
})

export const {
  setLoadApiKeys,
  setLoadApiKeysError,
  setIsApiKeysLoading,
  setNeed2FA,
  setTokenExpiry,
  setSecretKey,
} = apiKeysSlice.actions

export default apiKeysSlice.reducer
