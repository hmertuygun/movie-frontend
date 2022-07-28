import simpleTradeSlice from './SimpleTradeSlice'

const {
  setEntry,
  setTargets,
  removeTargets,
  setStopLoss,
  removeStopLoss,
  clearTradeState,
} = simpleTradeSlice.actions

const addEntry =
  ({ trigger, price, quantity, symbol, type = 'limit', side = 'buy', total }) =>
  async (dispatch) => {
    dispatch(
      setEntry({
        trigger,
        price,
        quantity,
        symbol,
        type,
        side,
        total,
      })
    )
  }

const addMarketEntry =
  ({ price, quantity, symbol, type = 'market', side = 'buy', total }) =>
  async (dispatch) => {
    dispatch(
      setEntry({
        price,
        quantity,
        symbol,
        type,
        side,
        total,
      })
    )
  }

const addEntryStopLimit =
  ({
    trigger,
    price,
    quantity,
    symbol,
    type = 'stop-limit',
    side = 'buy',
    total,
  }) =>
  async (dispatch) => {
    dispatch(
      setEntry({
        trigger,
        quantity,
        symbol,
        type,
        side,
        total,
        price,
      })
    )
  }

const addEntryStopMarket =
  ({ trigger, quantity, symbol, type = 'stop-market', side = 'buy', total }) =>
  async (dispatch) => {
    dispatch(
      setEntry({
        trigger,
        quantity,
        symbol,
        type,
        side,
        total,
      })
    )
  }

const addTarget =
  ({
    price,
    triggerPrice,
    quantity,
    profit,
    symbol,
    type = 'limit',
    side = 'sell',
  }) =>
  async (dispatch) => {
    dispatch(
      setTargets({
        price,
        triggerPrice,
        quantity,
        profit,
        symbol,
        type,
        side,
      })
    )
  }

const addStopMarketTarget =
  ({
    triggerPrice,
    quantity,
    profit,
    symbol,
    type = 'stop-market',
    side = 'sell',
  }) =>
  async (dispatch) => {
    dispatch(
      setTargets({
        triggerPrice,
        quantity,
        profit,
        symbol,
        type,
        side,
      })
    )
  }

const addStoplossLimit =
  ({
    price,
    triggerPrice,
    quantity,
    profit,
    symbol,
    side = 'sell',
    type = 'stop-limit',
  }) =>
  async (dispatch) => {
    dispatch(
      setStopLoss({
        price,
        profit,
        triggerPrice,
        quantity,
        side,
        type,
        symbol,
      })
    )
  }

const addStoplossMarket =
  ({
    triggerPrice,
    quantity,
    profit,
    symbol,
    side = 'sell',
    type = 'stop-market',
  }) =>
  async (dispatch) => {
    dispatch(
      setStopLoss({
        profit,
        triggerPrice,
        quantity,
        side,
        type,
        symbol,
      })
    )
  }

const resetTradeState = () => async (dispatch) => {
  dispatch(clearTradeState())
}

const resetStoploss = (index) => async (dispatch) => {
  dispatch(removeStopLoss({ removeIndex: index }))
}

const resetTarget = (index) => async (dispatch) => {
  dispatch(removeTargets({ removeIndex: index }))
}

export {
  addEntry,
  addMarketEntry,
  addEntryStopLimit,
  addEntryStopMarket,
  addTarget,
  addStopMarketTarget,
  addStoplossLimit,
  addStoplossMarket,
  resetTradeState,
  resetStoploss,
  resetTarget,
}
