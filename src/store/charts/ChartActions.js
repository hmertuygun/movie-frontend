import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  loadBalance,
  loadExchanges,
  loadLastPrice,
  updateExchangeType,
  updateSelectedSymbol,
  updateSelectedSymbolDetail,
  updateSymbolType,
} from 'store/actions'
import {
  setChartData,
  setChartMirroring,
  setIsChartReady,
  setActiveDrawingId,
  setActiveDrawing,
  setAddedDrawing,
  setChartDrawings,
  setSettingChartDrawings,
  setSunburstChart,
} from './ChartSlice'
import { DEFAULT_EXCHANGE, DEFAULT_SYMBOL_LOAD_SLASH } from 'constants/Default'
import { storage } from 'services/storages'
import {
  backupDrawings,
  getChartDrawings,
  getChartMetaInfo,
  updateDrawings,
} from 'services/api'

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

const getChartMetaData = createAsyncThunk(
  'chart/getChartMetaInfo',
  async () => {
    return await getChartMetaInfo()
  }
)

const getChartDrawing = createAsyncThunk('chart/getDrawings', async () => {
  return await getChartDrawings()
})

const saveChartDrawings = createAsyncThunk(
  'chart/updateDrawings',
  async (data) => {
    return await updateDrawings({ data: data })
  }
)

const backupChartDrawing = createAsyncThunk(
  'chart/backupDrawings',
  async (data) => {
    return await backupDrawings({ data: data })
  }
)

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
        dispatch(getChartDrawing()).then((res) => {
          let value = res.payload.data

          let intervals = value && value.intervals
          let timeZone = value && value.timeZone
          const chartData = {
            intervals: intervals || [],
            timeZone:
              timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            lastSelectedSymbol: `${DEFAULT_EXCHANGE}:${DEFAULT_SYMBOL_LOAD_SLASH}`,
          }

          dispatch(updateChartData({ ...chartData }))
          let [exchangeVal, symbolVal] = chartData.lastSelectedSymbol.split(':')
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
        })
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
  updateChartDataOnInit,
  updateSunburstChart,
  getChartMetaData,
  getChartDrawing,
  saveChartDrawings,
  backupChartDrawing,
}
