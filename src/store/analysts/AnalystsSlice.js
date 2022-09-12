import { createSlice } from '@reduxjs/toolkit'
import { DEFAULT_EMOJIS } from 'constants/Default'
import { storage } from 'services/storages'
import { getAnalystFlags } from './AnalystsActions'

const analystsSlice = createSlice({
  name: 'analysts',
  initialState: {
    allAnalysts: [],
    isAnalyst: false,
    emojis: DEFAULT_EMOJIS,
    selectEmojiPopoverOpen: false,
  },
  reducers: {
    setAllAnalysts: (state, action) => {
      state.allAnalysts = action.payload
    },
    setIsAnalyst: (state, action) => {
      state.isAnalyst = action.payload
    },
    setEmojis: (state, action) => {
      state.emojis = action.payload
    },
    setSelectEmojiPopoverOpen: (state, action) => {
      state.selectEmojiPopoverOpen = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAnalystFlags.fulfilled, (state, action) => {
      const emojis = action.payload.data
      storage.set('flags', JSON.stringify(emojis))
      state.emojis = emojis
    })
  },
})

export const {
  setAllAnalysts,
  setIsAnalyst,
  setEmojis,
  setSelectEmojiPopoverOpen,
} = analystsSlice.actions

export default analystsSlice.reducer
