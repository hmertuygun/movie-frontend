import { createSlice } from '@reduxjs/toolkit'

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    isOrderPlaced: false,
    isOrderCancelled: false,
    openOrdersUC: [],
    delOpenOrders: null,
    orderEdited: false,
  },
  reducers: {
    setIsOrderPlaced: (state, action) => {
      state.isOrderPlaced = action.payload
    },
    setIsOrderCancelled: (state, action) => {
      state.isOrderCancelled = action.payload
    },
    setOpenOrdersUC: (state, action) => {
      state.openOrdersUC = action.payload
    },
    setDelOpenOrders: (state, action) => {
      state.delOpenOrders = action.payload
    },
    setOrderEdited: (state, action) => {
      state.orderEdited = action.payload
    },
  },
})

export default orderSlice
