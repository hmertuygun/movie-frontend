import { createAsyncThunk } from '@reduxjs/toolkit'
import { fetchApiKeys, updateApiKeys } from 'services/api'
import {
  setLoadApiKeys,
  setLoadApiKeysError,
  setIsApiKeysLoading,
  setNeed2FA,
  setShow2FAModal,
  setTokenExpiry,
  setSecretKey,
} from './ApiKeysSlice'

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

const updateShow2FAModal = (value) => async (dispatch) => {
  dispatch(setShow2FAModal(value))
}

const updateTokenExpiry = (value) => async (dispatch) => {
  dispatch(setTokenExpiry(value))
}

const updateSecretKey = (value) => async (dispatch) => {
  dispatch(setSecretKey(value))
}

const getApiKeys = createAsyncThunk('chart/getApiKeys', async () => {
  return await fetchApiKeys()
})

const saveApiKeys = createAsyncThunk('chart/saveApiKeys', async (data) => {
  return await updateApiKeys(data)
})

export {
  updateLoadApiKeys,
  updateLoadApiKeysError,
  updateIsApiKeysLoading,
  updateNeed2FA,
  updateShow2FAModal,
  updateTokenExpiry,
  updateSecretKey,
  getApiKeys,
  saveApiKeys,
}
