import { createSlice } from '@reduxjs/toolkit'

const tradeSlice = createSlice({
  name: 'trades',
  initialState: {
    isTradersModalOpen: false,
    activeTrader: {},
  },
  reducers: {
    setIsTradersModalOpen: (state, action) => {
      state.isTradersModalOpen = action.payload
    },
    setActiveTrader: (state, action) => {
      state.activeTrader = action.payload
    },
  },
})

export default tradeSlice
