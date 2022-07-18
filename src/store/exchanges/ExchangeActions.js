import {
  DEFAULT_ACTIVE_EXCHANGE,
  DEFAULT_SYMBOL_LOAD_DASH,
  DEFAULT_SYMBOL_LOAD_SLASH,
} from 'constants/Default'
import { notify } from 'reapop'
import { firebase } from 'services/firebase'
import {
  FCMSubscription,
  getExchanges,
  getFirestoreDocumentData,
  getOneExchange,
  updateLastSelectedAPIKey,
  updateLastSelectedValue,
} from 'services/api'
import { session, storage } from 'services/storages'
import {
  handleOnboardingShow,
  updateIsApiKeysLoading,
  updateLoadApiKeys,
  updateLoadApiKeysError,
  updateLoaderVisible,
  updateSelectedSymbolDetail,
  updateSymbolDetails,
  updateSymbols,
  updateUserContextLoaded,
  updateUserData,
} from 'store/actions'
import { sortExchangesData } from 'utils/apiKeys'
import exchangeSlice from './ExchangeSlice'

const {
  setExchanges,
  setIsExchangeLoading,
  setExchangeType,
  setExchangeUpdated,
  setActiveDD,
  setTotalExchanges,
  setActiveExchange,
  setIsException,
} = exchangeSlice.actions

const updateExchanges = (exchanges) => async (dispatch) => {
  dispatch(setExchanges(exchanges))
}

const updateIsExchangeLoading = (value) => async (dispatch) => {
  dispatch(setIsExchangeLoading(value))
}

const updateExchangeType = (type) => async (dispatch) => {
  dispatch(setExchangeType(type))
}

const updateExchangeUpdated = (value) => async (dispatch) => {
  dispatch(setExchangeUpdated(value))
}

const updateExchangeKey =
  (exchange, setSymbol, activeExchange, userData) => async (dispatch) => {
    try {
      // if user selects the selected option again in the dropdown
      if (
        activeExchange.apiKeyName === exchange.apiKeyName &&
        activeExchange.exchange === exchange.exchange
      ) {
        return
      }
      dispatch(updateExchangeUpdated(true))
      dispatch(updateLoaderVisible(true))
      let value = `${exchange.apiKeyName}-${exchange.exchange}`
      await updateLastSelectedValue(userData.email, value)
      dispatch(setActiveExchange(exchange))
      sessionStorage.setItem('exchangeKey', JSON.stringify(exchange))
      const val = `${exchange.exchange.toUpperCase()}:${DEFAULT_SYMBOL_LOAD_SLASH}`
      await setSymbol({ label: DEFAULT_SYMBOL_LOAD_DASH, value: val })
    } catch (e) {
      notify({
        status: 'error',
        title: 'Error',
        message: 'Error activating this exchange key!',
      })
    } finally {
    }
  }

const loadExchanges = (symbol, exchange) => async (dispatch) => {
  try {
    dispatch(updateIsExchangeLoading(true))
    const oneExchangeResp = await getOneExchange(exchange)
    if (
      !oneExchangeResp?.exchanges?.length ||
      !oneExchangeResp?.symbolsChange
    ) {
      return
    }

    dispatch(updateSymbolDetails(oneExchangeResp.symbolsChange))
    dispatch(setActiveDD(oneExchangeResp.exchanges[0].symbols))
    dispatch(updateIsExchangeLoading(false))
    const val = `${exchange.toUpperCase()}:${symbol}`
    dispatch(updateSelectedSymbolDetail(oneExchangeResp.symbolsChange[val]))
    const data = await getExchanges()
    if (!data?.exchanges?.length || !data?.symbolsChange) {
      return
    }

    //get all exchanges and symbols
    const allSymbols = data.exchanges
      .filter(function (e) {
        return e.exchange !== 'ftx'
      })
      .map(function (val) {
        return val.symbols
      })
      .reduce(function (pre, cur) {
        return pre.concat(cur)
      })
      .map(function (e, i) {
        return e
      })

    dispatch(updateSymbols(allSymbols))
    dispatch(updateSymbolDetails(data.symbolsChange))
    storage.set('symbolsKeyValue', JSON.stringify(data.symbolsChange))
  } catch (error) {
    console.error(error)
    dispatch(updateIsExchangeLoading(false))
  } finally {
    dispatch(updateIsExchangeLoading(false))
  }
}

const updateTotalExchanges = (value) => async (dispatch) => {
  dispatch(setTotalExchanges(value))
}

const updateActiveExchange = (value) => async (dispatch) => {
  dispatch(setActiveExchange(value))
}

const updateIsException = (value) => async (dispatch) => {
  dispatch(setIsException(value))
}

const initExchanges = (userData, isOnboardingSkipped) => async (dispatch) => {
  if (userData.email) {
    dispatch(updateIsApiKeysLoading(true))
    try {
      getFirestoreDocumentData('apiKeyIDs', userData.email).then((apiKey) => {
        if (apiKey.data()) {
          dispatch(updateIsApiKeysLoading(false))
          dispatch(updateUserContextLoaded(true))
          let apiKeys = sortExchangesData(apiKey.data())
          if (!apiKeys?.length && isOnboardingSkipped) {
            apiKeys = DEFAULT_ACTIVE_EXCHANGE
          } else {
            dispatch(handleOnboardingShow())
          }

          if (apiKeys) {
            if (!apiKeys?.length) {
              dispatch(updateUserContextLoaded(true))
              return
            }
          } else {
            dispatch(updateLoadApiKeysError(true))
          }
          dispatch(updateTotalExchanges(apiKeys))
          let getSavedKey = session.get('exchangeKey')
          const ssData = JSON.parse(getSavedKey)
          if (
            ssData &&
            apiKeys.findIndex(
              (item) =>
                item.apiKeyName === ssData.apiKeyName &&
                item.exchange === ssData.exchange
            ) > -1
          ) {
            dispatch(updateActiveExchange({ ...ssData }))
            if (!isOnboardingSkipped) {
              dispatch(updateLoadApiKeys(true))
            }
          } else {
            let activeKey = apiKeys.find(
              (item) => item.isLastSelected === true && item.status === 'Active'
            )
            if (activeKey) {
              const data = {
                ...activeKey,
                label: `${activeKey.exchange} - ${activeKey.apiKeyName}`,
                value: `${activeKey.exchange} - ${activeKey.apiKeyName}`,
              }
              if (!isOnboardingSkipped) {
                dispatch(updateLoadApiKeys(true)) // Only check active api exchange eventually
              }
              dispatch(updateActiveExchange(data))
              session.set('exchangeKey', JSON.stringify(data))
            } else {
              // find the first one that is 'Active'
              let active = apiKeys.find((item) => item.status === 'Active')
              if (active) {
                updateLastSelectedAPIKey({ ...active })
                const data = {
                  ...active,
                  label: `${active.exchange} - ${active.apiKeyName}`,
                  value: `${active.exchange} - ${active.apiKeyName}`,
                }
                dispatch(updateActiveExchange(data))
                session.set('exchangeKey', JSON.stringify(data))
                if (!isOnboardingSkipped) {
                  dispatch(updateLoadApiKeys(true))
                }
              }
            }
          }
        }
      })
    } catch (e) {
      console.log(e)
      dispatch(updateIsApiKeysLoading(false))
      dispatch(updateLoadApiKeysError(true))
      dispatch(updateUserContextLoaded(true))
    }
  }
}

const getUserExchangesAfterFBInit =
  (userData, isOnboardingSkipped) => async (dispatch) => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in.
        dispatch(updateUserData(user))
        dispatch(initExchanges(user, isOnboardingSkipped))
        if (firebase.messaging.isSupported()) {
          FCMSubscription()
        }
      } else {
        // User is signed out.
      }
    })
  }

export {
  updateExchanges,
  updateIsExchangeLoading,
  updateExchangeType,
  updateExchangeUpdated,
  updateExchangeKey,
  loadExchanges,
  updateTotalExchanges,
  updateActiveExchange,
  updateIsException,
  initExchanges,
  getUserExchangesAfterFBInit,
}
