import { getFirestoreDocumentData } from 'services/api'
import { storage } from 'services/storages'
import { updateExchanges } from 'store/actions'
import { sortExchangesData } from 'utils/apiKeys'
import refreshSlice from './RefreshSlice'
import {
  analyticsTimeInterval,
  openOrdersTimeInterval,
  orderHistoryTimeInterval,
  portfolioTimeInterval,
} from 'constants/TimeIntervals'

const {
  setDisableOrderHistoryRefreshBtn,
  setDisableOpenOrdesrRefreshBtn,
  setDisablePortfolioRefreshBtn,
  setDisableAnalyticsRefreshBtn,
} = refreshSlice.actions

const updateDisableOrderHistoryRefreshBtn = (value) => async (dispatch) => {
  dispatch(setDisableOrderHistoryRefreshBtn(value))
}

const updateDisableOpenOrdesrRefreshBtn = (value) => async (dispatch) => {
  dispatch(setDisableOpenOrdesrRefreshBtn(value))
}

const updateDisablePortfolioRefreshBtn = (value) => async (dispatch) => {
  dispatch(setDisablePortfolioRefreshBtn(value))
}

const updateDisableAnalyticsRefreshBtn = (value) => async (dispatch) => {
  dispatch(setDisableAnalyticsRefreshBtn(value))
}

const refreshKeys = {
  'order-history': {
    refreshFunc: updateDisableOrderHistoryRefreshBtn,
    key: 'orderHistoryRefreshBtn',
    delay: orderHistoryTimeInterval,
  },
  'open-order': {
    refreshFunc: updateDisableOpenOrdesrRefreshBtn,
    key: 'openOrdersRefreshBtn',
    delay: openOrdersTimeInterval,
  },
  portfolio: {
    refreshFunc: updateDisablePortfolioRefreshBtn,
    key: 'portfolioRefreshBtn',
    delay: portfolioTimeInterval,
  },
  analytics: {
    refreshFunc: updateDisableAnalyticsRefreshBtn,
    key: 'analyticsRefreshBtn',
    delay: analyticsTimeInterval,
  },
}

const updateRefreshButton = (value) => async (dispatch) => {
  const refreshType = refreshKeys[value]
  dispatch(refreshType.refreshFunc(true))
  storage.set(refreshType['key'], Date.now())
  setTimeout(() => {
    dispatch(refreshType.refreshFunc(false))
  }, refreshType.delay)
}

const refreshExchanges = (userData) => async (dispatch) => {
  if (userData.email) {
    try {
      getFirestoreDocumentData('apiKeyIDs', userData.email).then((apiKey) => {
        if (apiKey.data()) {
          let apiKeys = sortExchangesData(apiKey.data())
          if (!apiKeys.length) return
          const keys = apiKeys.map((item) => {
            return {
              ...item,
              label: `${item.exchange} - ${item.apiKeyName}`,
              value: `${item.exchange} - ${item.apiKeyName}`,
            }
          })
          dispatch(updateExchanges(keys))
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
}

export {
  updateDisableOrderHistoryRefreshBtn,
  updateDisableOpenOrdesrRefreshBtn,
  updateDisablePortfolioRefreshBtn,
  updateDisableAnalyticsRefreshBtn,
  updateRefreshButton,
  refreshExchanges,
}
