import { createSlice } from '@reduxjs/toolkit'
import { DEFAULT_EMOJIS } from 'constants/Default'

const emojiSlice = createSlice({
  name: 'emojis',
  initialState: {
    emojis: DEFAULT_EMOJIS,
    selectEmojiPopoverOpen: false,
  },
  reducers: {
    setEmojis: (state, action) => {
      state.emojis = action.payload
    },
    setSelectEmojiPopoverOpen: (state, action) => {
      state.selectEmojiPopoverOpen = action.payload
    },
  },
})

export default emojiSlice
