import { createSlice } from '@reduxjs/toolkit'

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
})

export default chartSlice
