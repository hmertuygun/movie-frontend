import { getFirestoreDocumentData } from 'services/api'
import {
  handleOnboardingSkip,
  loadBalance,
  loadExchanges,
  loadLastPrice,
  updateExchangeType,
  updateSelectedSymbol,
  updateSelectedSymbolDetail,
  updateSymbolType,
} from 'store/actions'
import chartSlice from './ChartSlice'
import { firebase } from 'services/firebase'
import { DEFAULT_EXCHANGE, DEFAULT_SYMBOL_LOAD_SLASH } from 'constants/Default'
import { storage } from 'services/storages'

const {
  setChartData,
  setChartMirroring,
  setIsChartReady,
  setActiveDrawingId,
  setActiveDrawing,
  setAddedDrawing,
  setChartDrawings,
  setSettingChartDrawings,
  setSunburstChart,
} = chartSlice.actions

const updateChartData = (emojis) => async (dispatch) => {
  dispatch(setChartData(emojis))
}

const updateChartMirroring = (emojis) => async (dispatch) => {
  dispatch(setChartMirroring(emojis))
}

const updateIsChartReady = (value) => async (dispatch) => {
  dispatch(setIsChartReady(value))
}
const updateActiveDrawingId = (emojis) => async (dispatch) => {
  dispatch(setActiveDrawingId(emojis))
}

const updateActiveDrawing = (value) => async (dispatch) => {
  dispatch(setActiveDrawing(value))
}
const updateAddedDrawing = (emojis) => async (dispatch) => {
  dispatch(setAddedDrawing(emojis))
}

const updateChartDrawings = (value) => async (dispatch) => {
  dispatch(setChartDrawings(value))
}
const updateSettingChartDrawings = (emojis) => async (dispatch) => {
  dispatch(setSettingChartDrawings(emojis))
}
const updateSunburstChart = (emojis) => async (dispatch) => {
  dispatch(setSunburstChart(emojis))
}

const getChartMirroring = () => async (dispatch) => {
  //test
  try {
    const currentUser = firebase.auth().currentUser
    getFirestoreDocumentData('stripe_users', currentUser.uid).then(
      async (doc) => {
        if (doc.data()?.chartMirroringSignUp) {
          dispatch(handleOnboardingSkip())
          dispatch(updateChartMirroring(doc.data().chartMirroringSignUp))
        } else {
          dispatch(updateChartMirroring(false))
        }
      }
    )
  } catch (error) {
    console.log(error)
  }
}

const updateChartDataOnInit =
  (
    userData,
    watchListOpen,
    activeExchange,
    templateDrawingsOpen,
    exchangeUpdated,
    isOnboardingSkipped
  ) =>
  async (dispatch) => {
    try {
      const exchange =
        templateDrawingsOpen && watchListOpen
          ? 'binance'
          : activeExchange.exchange
      if (userData?.email) {
        getFirestoreDocumentData('chart_drawings', userData.email).then(
          (userSnapShot) => {
            let value = userSnapShot?.data()

            let intervals = value && value.intervals
            let timeZone = value && value.timeZone
            const chartData = {
              intervals: intervals || [],
              timeZone:
                timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
              lastSelectedSymbol: `${DEFAULT_EXCHANGE}:${DEFAULT_SYMBOL_LOAD_SLASH}`,
            }

            dispatch(updateChartData({ ...chartData }))
            let [exchangeVal, symbolVal] =
              chartData.lastSelectedSymbol.split(':')
            exchangeVal =
              exchange || exchangeVal.toLowerCase() || DEFAULT_EXCHANGE
            symbolVal = exchangeUpdated
              ? DEFAULT_SYMBOL_LOAD_SLASH
              : symbolVal
              ? symbolVal
              : DEFAULT_SYMBOL_LOAD_SLASH
            storage.set('selectedExchange', exchangeVal)
            storage.set('selectedSymbol', symbolVal)
            const [baseAsset, qouteAsset] = symbolVal.split('/')
            dispatch(
              loadBalance(
                qouteAsset,
                baseAsset,
                activeExchange,
                isOnboardingSkipped
              )
            )
            dispatch(
              updateSelectedSymbolDetail({
                base_asset: baseAsset,
                quote_asset: qouteAsset,
              })
            ) // to show balance in trade panel quickly
            dispatch(updateSymbolType(symbolVal))
            dispatch(loadExchanges(symbolVal, exchangeVal))
            dispatch(
              updateSelectedSymbol({
                label: symbolVal.replace('/', '-'),
                value: `${exchangeVal.toUpperCase()}:${symbolVal}`,
              })
            )
            if (userData.isLoggedIn)
              dispatch(loadLastPrice(symbolVal, exchangeVal))
            dispatch(updateExchangeType(exchange.toLowerCase()))
            storage.set('selectedExchange', exchange.toLowerCase())
          }
        )
      }
    } catch (e) {
      console.error(e)
    } finally {
    }
  }

export {
  updateChartData,
  updateChartMirroring,
  updateIsChartReady,
  updateActiveDrawingId,
  updateActiveDrawing,
  updateAddedDrawing,
  updateChartDrawings,
  updateSettingChartDrawings,
  getChartMirroring,
  updateChartDataOnInit,
  updateSunburstChart,
}
