import { createSlice } from '@reduxjs/toolkit'
import { config } from 'constants/config'
import { session, storage } from 'services/storages'
import { getUserData, saveUserData } from './UsersActions'
const userDetails = storage.get('user', true)
const lRemember = storage.get('remember')
const sRemember = session.get('remember')
const l2faUserDetails = storage.get('2faUserDetails', true)
let initialUserState = {}
if (
  userDetails !== 'undefined' &&
  (sRemember === 'true' || lRemember === 'true')
) {
  initialUserState = {
    user: userDetails,
    ...l2faUserDetails,
  }
} else {
  initialUserState = {
    user: null,
    has2FADetails: null,
    is2FAVerified: false,
  }
}

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    userData: false,
    userState: initialUserState,
    userContextLoaded: false,
    isSubOpen: config.subscription,
    firstLogin: false,
    isCanaryUser: false,
    country: '',
    isCountryAvailable: true,
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload
    },
    setUserState: (state, action) => {
      state.userState = action.payload
    },
    setUserContextLoaded: (state, action) => {
      state.userContextLoaded = action.payload
    },
    setFirstLogin: (state, action) => {
      state.firstLogin = action.payload
    },
    setIsCanaryUser: (state, action) => {
      state.isCanaryUser = action.payload
    },
    setCountry: (state, action) => {
      state.country = action.payload
    },
    setIsCountryAvailable: (state, action) => {
      state.isCountryAvailable = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserData.fulfilled, (state, action) => {
      const res = action.payload.data.data
      state.firstLogin = res ? res.firstLogin : false
      state.country = res?.country
      state.isCountryAvailable = !!res
    })
    builder.addCase(saveUserData.fulfilled, (state, action) => {
      const { firstLogin } = action.meta.arg
      state.firstLogin = firstLogin || false
    })
  },
})

export const {
  setUserData,
  setUserState,
  setUserContextLoaded,
  setFirstLogin,
  setIsCanaryUser,
  setCountry,
  setIsCountryAvailable,
} = usersSlice.actions

export default usersSlice.reducer
