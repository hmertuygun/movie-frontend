import { deleteWatchLists, fetchWatchList, updateWatchList } from 'services/api'

import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  setActiveWatchList,
  setSymbolsList,
  setWatchSymbolsLists,
} from './WatchlistSlice'

const getWatchList = createAsyncThunk(
  'watchlist/getWatchList',
  async (email) => {
    return await fetchWatchList(email)
  }
)

const saveWatchList = createAsyncThunk(
  'watchlist/saveWatchList',
  async (data) => {
    return await updateWatchList({ data })
  }
)

const deleteWatchList = createAsyncThunk(
  'watchlist/deleteWatchList',
  async (data) => {
    return await deleteWatchLists(data)
  }
)

const updateSymbolsLists = (value) => async (dispatch) => {
  dispatch(setSymbolsList(value))
}

const updateWatchSymbolsLists = (value) => async (dispatch) => {
  dispatch(setWatchSymbolsLists(value))
}

const updateActiveWatchLists = (value) => async (dispatch) => {
  dispatch(setActiveWatchList(value))
}

export {
  getWatchList,
  saveWatchList,
  deleteWatchList,
  updateSymbolsLists,
  updateWatchSymbolsLists,
  updateActiveWatchLists,
}
