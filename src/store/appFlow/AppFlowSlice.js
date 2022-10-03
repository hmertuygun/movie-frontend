import { createSlice } from '@reduxjs/toolkit'
import { getPlatformMessages, getUserNotices } from './AppFlowActions'

const appFlowSlice = createSlice({
  name: 'appFlow',
  initialState: {
    isOnboardingSkipped: null,
    rememberCheck: false,
    loaderText: 'Loading data from new exchange ...',
    loaderVisible: false,
    onTour: false,
    isTourStep5: false,
    isTourFinished: false,
    onSecondTour: false,
    tour2CurrentStep: 0,
    twofaSecretKey: '',
    endTrial: false,
    needPayment: false,
    showSubModalIfLessThan7Days: false,
    platformMessages: [],
    userNotices: [],
    showThemeWarning: false,
    chartNeedsThemeUpdate: false,
  },
  reducers: {
    setIsOnboardingSkipped: (state, action) => {
      state.isOnboardingSkipped = action.payload
    },
    setRememberCheck: (state, action) => {
      state.rememberCheck = action.payload
    },
    setLoaderVisible: (state, action) => {
      state.loaderVisible = action.payload
    },
    setOnTour: (state, action) => {
      state.onTour = action.payload
    },
    setIsTourStep5: (state, action) => {
      state.isTourStep5 = action.payload
    },
    setIsTourFinished: (state, action) => {
      state.isTourFinished = action.payload
    },
    setOnSecondTour: (state, action) => {
      state.onSecondTour = action.payload
    },
    setTour2CurrentStep: (state, action) => {
      state.tour2CurrentStep = action.payload
    },
    setTwofaSecretKey: (state, action) => {
      state.twofaSecretKey = action.payload
    },
    setEndTrial: (state, action) => {
      state.endTrial = action.payload
    },
    setNeedPayment: (state, action) => {
      state.needPayment = action.payload
    },
    setShowSubModal: (state, action) => {
      state.showSubModalIfLessThan7Days = action.payload
    },
    setShowThemeWarning: (state, action) => {
      state.showThemeWarning = action.payload
    },
    setChartNeedsThemeUpdate: (state, action) => {
      state.chartNeedsThemeUpdate = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getPlatformMessages.fulfilled, (state, action) => {
      let platformMessages = action.payload.data.data.map((item) => {
        const key = Object.keys(item)[0]
        return { id: key, ...item[key] }
      })
      state.platformMessages = platformMessages
    })
    builder.addCase(getUserNotices.fulfilled, (state, action) => {
      const userNotices = action?.payload?.data?.data || []
      state.userNotices = userNotices
    })
  },
})

export const {
  setIsOnboardingSkipped,
  setRememberCheck,
  setLoaderVisible,
  setOnTour,
  setIsTourStep5,
  setIsTourFinished,
  setOnSecondTour,
  setTour2CurrentStep,
  setTwofaSecretKey,
  setEndTrial,
  setNeedPayment,
  setShowSubModal,
  setShowThemeWarning,
  setChartNeedsThemeUpdate,
} = appFlowSlice.actions

export default appFlowSlice.reducer
