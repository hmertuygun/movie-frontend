import { createSlice } from '@reduxjs/toolkit'

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    isCheckingSub: false,
    hasSub: true,
    subscriptionData: null,
    trialDaysLeft: 0,
    isPaidUser: false,
    createSubscription: false,
    subscriptionError: '',
  },
  reducers: {
    setIsCheckingSub: (state, action) => {
      state.isCheckingSub = action.payload
    },
    setHasSub: (state, action) => {
      state.hasSub = action.payload
    },
    setSubscriptionData: (state, action) => {
      state.subscriptionData = action.payload
    },
    setTrialDaysLeft: (state, action) => {
      state.trialDaysLeft = action.payload
    },
    setIsPaidUser: (state, action) => {
      state.isPaidUser = action.payload
    },
    setCreateSubscription: (state, action) => {
      state.createSubscription = action.payload
    },
    setSubscriptionError: (state, action) => {
      state.subscriptionError = action.payload
    },
  },
})

export default subscriptionSlice
