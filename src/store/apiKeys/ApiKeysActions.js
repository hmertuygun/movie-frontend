import apiKeysSlice from './ApiKeysSlice'
const { setLoadApiKeys, setLoadApiKeysError, setIsApiKeysLoading } =
  apiKeysSlice.actions

const updateLoadApiKeys = (value) => async (dispatch) => {
  dispatch(setLoadApiKeys(value))
}

const updateLoadApiKeysError = (value) => async (dispatch) => {
  dispatch(setLoadApiKeysError(value))
}

const updateIsApiKeysLoading = (value) => async (dispatch) => {
  dispatch(setIsApiKeysLoading(value))
}

export { updateLoadApiKeys, updateLoadApiKeysError, updateIsApiKeysLoading }
