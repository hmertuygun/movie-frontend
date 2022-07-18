import { createSlice } from '@reduxjs/toolkit'
import { config } from 'constants/config'
import { session, storage } from 'services/storages'
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
    allAnalysts: [],
    isAnalyst: false,
    firstLogin: true,
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
    setAllAnalysts: (state, action) => {
      state.allAnalysts = action.payload
    },
    setIsAnalyst: (state, action) => {
      state.isAnalyst = action.payload
    },
    setFirstLogin: (state, action) => {
      state.firstLogin = action.payload
    },
  },
})

export default usersSlice
