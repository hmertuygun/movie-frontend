import { notify } from 'reapop'
import { getBalance, getLastPrice } from 'services/api'
import { storage } from 'services/storages'
import symbolSlice from './SymbolSlice'

const {
  setSymbols,
  setSymbolDetails,
  setSelectedSymbol,
  setSelectedSymbolDetail,
  setSelectedSymbolBalance,
  setSelectedBaseSymbolBalance,
  setIsLoadingBalance,
  setSelectedSymbolLastPrice,
  setIsLoadingLastPrice,
  setSymbolType,
} = symbolSlice.actions

const updateSymbols = (symbols) => async (dispatch) => {
  dispatch(setSymbols(symbols))
}

const updateSymbolDetails = (symbol) => async (dispatch) => {
  dispatch(setSymbolDetails(symbol))
}

const updateSelectedSymbol = (symbol) => async (dispatch) => {
  dispatch(setSelectedSymbol(symbol))
}

const updateSelectedSymbolDetail = (symbol) => async (dispatch) => {
  dispatch(setSelectedSymbolDetail(symbol))
}

const updateSelectedSymbolBalance = (balance) => async (dispatch) => {
  dispatch(setSelectedSymbolBalance(balance))
}

const updateSelectedBaseSymbolBalance = (balance) => async (dispatch) => {
  dispatch(setSelectedBaseSymbolBalance(balance))
}

const updateIsLoadingBalance = (value) => async (dispatch) => {
  dispatch(setIsLoadingBalance(value))
}

const updateSelectedSymbolLastPrice = (price) => async (dispatch) => {
  dispatch(setSelectedSymbolLastPrice(price))
}

const updateIsLoadingLastPrice = (price) => async (dispatch) => {
  dispatch(setIsLoadingLastPrice(price))
}

const updateSymbolType = (price) => async (dispatch) => {
  dispatch(setSymbolType(price))
}

const loadLastPrice =
  (symbolpair, activeExchange, exchange) => async (dispatch) => {
    try {
      const activeExc =
        exchange || storage.get('selectedExchange') || activeExchange?.exchange
      dispatch(updateIsLoadingLastPrice(true))
      const response = await getLastPrice(symbolpair, activeExc)
      const lastPrice =
        response?.data?.last_price !== 'NA' ? response.data.last_price : 0
      dispatch(updateSelectedSymbolLastPrice(lastPrice))
    } catch (err) {
      notify({
        id: 'last-price-warning',
        status: 'error',
        title: 'Error',
        message: 'Error getting last price of market!',
      })
      dispatch(updateSelectedSymbolLastPrice(0))
    } finally {
      dispatch(updateIsLoadingLastPrice(false))
    }
  }

const loadBalance =
  (
    quote_asset,
    base_asset,
    activeExchange,
    isOnboardingSkipped,
    skipCache = false
  ) =>
  async (dispatch) => {
    try {
      // solves an issue where you get incorrect symbol balance by clicking on diff symbols rapidly
      const getSymbolFromLS = storage.get('selectedSymbol')
      if (
        !activeExchange?.exchange ||
        !quote_asset ||
        (!base_asset &&
          getSymbolFromLS &&
          `${base_asset}/${quote_asset}` !== getSymbolFromLS)
      )
        return
      dispatch(updateIsLoadingBalance(true))

      if (!isOnboardingSkipped) {
        const quoteBalance = await getBalance({
          symbol: quote_asset,
          skipCache,
          ...activeExchange,
        })
        const quoteBal = quoteBalance?.data?.balance
          ? quoteBalance.data.balance
          : 0

        dispatch(updateSelectedSymbolBalance(quoteBal))
        const baseBalance = await getBalance({
          symbol: base_asset,
          skipCache,
          ...activeExchange,
        })
        const baseDBalance = baseBalance?.data?.balance
          ? baseBalance.data.balance
          : 0
        dispatch(updateSelectedBaseSymbolBalance(baseDBalance))
      }
    } catch (err) {
      console.error(err)
      dispatch(updateSelectedSymbolBalance(0))
      dispatch(updateSelectedBaseSymbolBalance(0))
    } finally {
      dispatch(updateIsLoadingBalance(false))
    }
  }

export {
  updateSymbols,
  updateSymbolDetails,
  updateSelectedSymbol,
  updateSelectedSymbolDetail,
  updateSelectedSymbolBalance,
  updateSelectedBaseSymbolBalance,
  updateIsLoadingBalance,
  updateSelectedSymbolLastPrice,
  updateIsLoadingLastPrice,
  updateSymbolType,
  loadLastPrice,
  loadBalance,
}
