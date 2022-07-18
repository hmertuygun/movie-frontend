import orderSlice from './OrderSlice'

const {
  setIsOrderPlaced,
  setIsOrderCancelled,
  setOpenOrdersUC,
  setDelOpenOrders,
  setOrderEdited,
} = orderSlice.actions

const updateIsOrderPlaced = (value) => async (dispatch) => {
  dispatch(setIsOrderPlaced(value))
}
const updateIsOrderCancelled = (value) => async (dispatch) => {
  dispatch(setIsOrderCancelled(value))
}
const updateOpenOrdersUC = (value) => async (dispatch) => {
  dispatch(setOpenOrdersUC(value))
}
const updateDelOpenOrders = (value) => async (dispatch) => {
  dispatch(setDelOpenOrders(value))
}
const updateOrderEdited = (value) => async (dispatch) => {
  dispatch(setOrderEdited(value))
}

export {
  updateIsOrderPlaced,
  updateIsOrderCancelled,
  updateOpenOrdersUC,
  updateDelOpenOrders,
  updateOrderEdited,
}
