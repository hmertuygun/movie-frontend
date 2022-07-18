import { createSlice } from '@reduxjs/toolkit'

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
    country: '',
    isCountryAvailable: true,
    endTrial: false,
    needPayment: false,
    showSubModalIfLessThan7Days: false,
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
    setCountry: (state, action) => {
      state.country = action.payload
    },
    setIsCountryAvailable: (state, action) => {
      state.isCountryAvailable = action.payload
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
  },
})

export default appFlowSlice
