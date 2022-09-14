import { createSlice } from '@reduxjs/toolkit'
import LZUTF8 from 'lzutf8'
import {
  backupChartDrawing,
  getChartDrawing,
  getChartMetaData,
  saveChartDrawings,
} from './ChartActions'

const chartSlice = createSlice({
  name: 'charts',
  initialState: {
    chartData: null,
    chartMirroring: false,
    isChartReady: false,
    activeDrawingId: false,
    activeDrawing: false,
    addedDrawing: {},
    chartDrawings: null,
    settingChartDrawings: false,
    sunburstChart: null,
    chartMetaData: null,
  },
  reducers: {
    setChartData: (state, action) => {
      state.chartData = action.payload
    },
    setChartMirroring: (state, action) => {
      state.chartMirroring = action.payload
    },
    setIsChartReady: (state, action) => {
      state.isChartReady = action.payload
    },
    setActiveDrawingId: (state, action) => {
      state.activeDrawingId = action.payload
    },
    setActiveDrawing: (state, action) => {
      state.activeDrawing = action.payload
    },
    setAddedDrawing: (state, action) => {
      state.addedDrawing = action.payload
    },
    setChartDrawings: (state, action) => {
      state.chartDrawings = action.payload
    },
    setSettingChartDrawings: (state, action) => {
      state.settingChartDrawings = action.payload
    },
    setSunburstChart: (state, action) => {
      state.sunburstChart = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getChartMetaData.fulfilled, (state, action) => {
      const res = action.payload.data
      state.chartMetaData = res
    })
    builder.addCase(getChartDrawing.fulfilled, (state, action) => {
      const res = action.payload?.data
      if (res && res[0]) {
        const data = LZUTF8.decompress(res[Object.keys(res)[0]], {
          inputEncoding: 'Base64',
        })
        state.chartDrawings = data
      }
    })
    builder.addCase(saveChartDrawings.fulfilled, (state, action) => {})
    builder.addCase(backupChartDrawing.fulfilled, (state, action) => {})
  },
})
export const {
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

export default chartSlice.reducer
