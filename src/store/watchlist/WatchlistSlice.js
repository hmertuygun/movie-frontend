import { createSlice } from '@reduxjs/toolkit'

import {
  deleteWatchList,
  getWatchList,
  saveWatchList,
} from './WatchlistActions'

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState: {
    watchListData: {},
    watchLists: [],
    activeWatchList: {},
    symbolsList: [],
    watchSymbolsList: [],
  },
  reducers: {
    setWatchlists: (state, { payload }) => {
      state.watchLists = payload
    },
    setActiveWatchList: (state, { payload }) => {
      state.activeWatchList = payload
    },
    setSymbolsList: (state, { payload }) => {
      state.symbolsList = payload
    },
    setWatchSymbolsLists: (state, { payload }) => {
      state.watchSymbolsList = payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getWatchList.fulfilled, (state, action) => {
      const res = action.payload.data
      state.watchListData = res
      state.watchLists = res?.lists || []
      state.activeWatchList = state.watchLists[res?.activeList] || {}
    })
    builder.addCase(saveWatchList.fulfilled, (state, action) => {
      const { lists, activeList } = action.meta.arg
      let key = ''
      if (lists) {
        key = Object.keys(lists)[0]
        state.watchLists[key] = lists[key]
      }
      state.activeWatchList = state.watchLists[activeList || key] || {}
    })
    builder.addCase(deleteWatchList.fulfilled, (state, action) => {
      const { watchListName } = action.meta.arg
      delete state.watchLists[watchListName]
    })
  },
})

export const {
  setWatchlists,
  setActiveWatchList,
  setSymbolsList,
  setWatchSymbolsLists,
} = watchlistSlice.actions

export default watchlistSlice.reducer
