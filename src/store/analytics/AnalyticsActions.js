import { getAnalytics } from 'services/api'
import analyticsSlice from './AnalyticsSlice'
const {
  setPairOperations,
  setPairPerformance,
  setAssetPerformance,
  setAnalyticsLoading,
  setLoadingError,
} = analyticsSlice.actions

const updatePairOperations = (value) => async (dispatch) => {
  dispatch(setPairOperations(value))
}
const updatePairPerformance = (value) => async (dispatch) => {
  dispatch(setPairPerformance(value))
}
const updateAssetPerformance = (value) => async (dispatch) => {
  dispatch(setAssetPerformance(value))
}
const updateAnalyticsLoading = (value) => async (dispatch) => {
  dispatch(setAnalyticsLoading(value))
}
const updateLoadingError = (value) => async (dispatch) => {
  dispatch(setLoadingError(value))
}

const refreshAnalyticsData =
  (activeExchange, { startDate, endDate, skipCache }) =>
  async (dispatch) => {
    try {
      dispatch(updateAnalyticsLoading(true))
      const payload = {
        apiKeyName: activeExchange?.apiKeyName,
        exchange: activeExchange?.exchange,
      }
      if (startDate) payload.startDate = startDate
      if (endDate) payload.endDate = endDate
      if (skipCache) payload.skipCache = skipCache
      try {
        const { data } = await getAnalytics(payload)
        if (data) {
          dispatch(updatePairOperations(data.pair_operations))
          dispatch(updatePairPerformance(data.pair_performance))
          dispatch(updateAssetPerformance(data.asset_performance))
        }
      } catch (error) {
        console.log(error)
      }
      dispatch(updateAnalyticsLoading(false))
    } catch (error) {
      console.log(error)
      dispatch(updateAnalyticsLoading(false))
    }
  }
export {
  updatePairOperations,
  updatePairPerformance,
  updateAssetPerformance,
  updateAnalyticsLoading,
  updateLoadingError,
  refreshAnalyticsData,
}
