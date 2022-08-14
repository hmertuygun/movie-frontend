import apiKeysSlice from './ApiKeysSlice'
const {
  setLoadApiKeys,
  setLoadApiKeysError,
  setIsApiKeysLoading,
  setNeed2FA,
  setTokenExpiry,
  setSecretKey,
} = apiKeysSlice.actions

const updateLoadApiKeys = (value) => async (dispatch) => {
  dispatch(setLoadApiKeys(value))
}

const updateLoadApiKeysError = (value) => async (dispatch) => {
  dispatch(setLoadApiKeysError(value))
}

const updateIsApiKeysLoading = (value) => async (dispatch) => {
  dispatch(setIsApiKeysLoading(value))
}

const updateNeed2FA = (value) => async (dispatch) => {
  dispatch(setNeed2FA(value))
}

const updateTokenExpiry = (value) => async (dispatch) => {
  dispatch(setTokenExpiry(value))
}

const updateSecretKey = (value) => async (dispatch) => {
  dispatch(setSecretKey(value))
}

export {
  updateLoadApiKeys,
  updateLoadApiKeysError,
  updateIsApiKeysLoading,
  updateNeed2FA,
  updateTokenExpiry,
  updateSecretKey,
}
