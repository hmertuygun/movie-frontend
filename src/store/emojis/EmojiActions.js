import emojiSlice from './EmojiSlice'

const { setEmojis, setSelectEmojiPopoverOpen } = emojiSlice.actions

const updateEmojis = (emojis) => async (dispatch) => {
  dispatch(setEmojis(emojis))
}

const updateSelectEmojiPopoverOpen = (value) => async (dispatch) => {
  dispatch(setSelectEmojiPopoverOpen(value))
}

export { updateEmojis, updateSelectEmojiPopoverOpen }
