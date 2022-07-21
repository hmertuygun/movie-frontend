import MESSAGES from 'constants/Messages'
import { notify } from 'reapop'
import { getPortfolio } from 'services/api'
import { updateSunburstChart } from 'store/actions'
import portfolioSlice from './PortfolioSlice'
const {
  setTickers,
  setLastMessage,
  setEstimate,
  setBalance,
  setPortfolioLoading,
  setElapsed,
  setMarketData,
  setSelectedExchanges,
} = portfolioSlice.actions

const updateTickers = (value) => async (dispatch) => {
  dispatch(setTickers(value))
}
const updateLastMessage = (value) => async (dispatch) => {
  dispatch(setLastMessage(value))
}
const updateEstimate = (value) => async (dispatch) => {
  dispatch(setEstimate(value))
}
const updateBalance = (value) => async (dispatch) => {
  dispatch(setBalance(value))
}
const updatePortfolioLoading = (value) => async (dispatch) => {
  dispatch(setPortfolioLoading(value))
}
const updateElapsed = (value) => async (dispatch) => {
  dispatch(setElapsed(value))
}
const updatePortMarketData = (value) => async (dispatch) => {
  dispatch(setMarketData(value))
}
const updateSelectedExchanges = (value) => async (dispatch) => {
  dispatch(setSelectedExchanges(value))
}

const refreshPortfolioData =
  (selectedExchanges, isPortfolioPage, skipCache = false) =>
  async (dispatch) => {
    try {
      const payload = { exchanges: [] }
      selectedExchanges.forEach((element) => {
        payload.exchanges.push([element.exchange, element.apiKeyName])
      })
      dispatch(updatePortfolioLoading(true))
      const portfolioData = await getPortfolio(payload, skipCache)
      dispatch(updateBalance(portfolioData.data.BottomTable))
      if (portfolioData?.data?.elapsed) {
        const elapsedTime =
          portfolioData.data.elapsed === '0 second'
            ? 'Now'
            : `${portfolioData.data.elapsed} ago`
        dispatch(updateElapsed(elapsedTime))
      }

      dispatch(updateSunburstChart(portfolioData.data.Distribution))
      dispatch(updateEstimate(portfolioData.data.EstValue))
      dispatch(updatePortfolioLoading(false))
    } catch (error) {
      console.log(error)
      if (isPortfolioPage) {
        dispatch(notify(MESSAGES['portfolio-create-failed'], 'error'))
      }
      dispatch(updateBalance(null))
      dispatch(updateSunburstChart(null))
      dispatch(updateEstimate(null))
      dispatch(updatePortfolioLoading(false))
    }
  }

export {
  updateTickers,
  updateLastMessage,
  updateEstimate,
  updateBalance,
  updatePortfolioLoading,
  updateElapsed,
  updatePortMarketData,
  updateSelectedExchanges,
  refreshPortfolioData,
}
