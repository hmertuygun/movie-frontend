import { createSlice } from '@reduxjs/toolkit'
import { DEFAULT_WATCHLIST } from 'constants/Trade'

import {
  deleteWatchList,
  getWatchList,
  saveWatchList,
} from './WatchlistActions'

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState: {
    watchListData: {},
    watchLists: {},
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
      state.watchListData = res || {}
      state.watchLists = res?.lists || []
      state.activeWatchList = state.watchLists[res?.activeList] || {}
    })
    builder.addCase(saveWatchList.pending, (state, action) => {
      const { activeList } = action.meta.arg
      if (activeList) state.activeWatchList = state.watchLists[activeList] || {}
    })
    builder.addCase(saveWatchList.fulfilled, (state, action) => {
      const { lists, activeList } = action.meta.arg
      const { status } = action.payload
      let key = ''
      if (lists) {
        key = Object.keys(lists)[0]
        const watchlist = JSON.parse(JSON.stringify(state.watchLists))
        if (watchlist.length === 0) {
          const newData = { key: lists[key] }
          state.watchLists = newData
        } else {
          state.watchLists[key] = lists[key]
        }
      }
      if (activeList) {
        if (status === 200) {
          let watchlistData = {}
          if (activeList !== DEFAULT_WATCHLIST)
            watchlistData = JSON.parse(JSON.stringify(state.watchlistData))
          watchlistData.activeList = activeList
          state.watchListData = watchlistData
        } else {
          state.activeWatchList =
            state.watchLists[state.watchListData.activeList] || {}
        }
      }
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
