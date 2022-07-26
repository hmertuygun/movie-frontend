import {
  checkGoogleAuth2FA,
  deleteGoogleAuth2FA,
  getSnapShotCollection,
  saveGoogleAuth2FA,
  sendLoginInfo,
  validateUser,
  verifyGoogleAuth2FA,
} from 'services/api'
import { session, storage } from 'services/storages'
import usersSlice from './UsersSlice'
import { firebase } from 'services/firebase'
import { getUserExchangesAfterFBInit, handleCountry } from 'store/actions'
const T2FA_LOCAL_STORAGE = '2faUserDetails'

const {
  setUserData,
  setUserState,
  setUserContextLoaded,
  setAllAnalysts,
  setIsAnalyst,
  setFirstLogin,
} = usersSlice.actions

const updateUserData = (value) => async (dispatch) => {
  dispatch(setUserData(value))
}

const updateUserState = (value) => async (dispatch) => {
  dispatch(setUserState(value))
}

const updateUserContextLoaded = (value) => async (dispatch) => {
  dispatch(setUserContextLoaded(value))
}

const updateAllAnalysts = (value) => async (dispatch) => {
  dispatch(setAllAnalysts(value))
}

const updateIsAnalyst = (value) => async (dispatch) => {
  dispatch(setIsAnalyst(value))
}

const updateFirstLogin = (value) => async (dispatch) => {
  dispatch(setFirstLogin(value))
}

const fetchAnalysts = (userData) => async (dispatch) => {
  try {
    const snapshot = await getSnapShotCollection('analysts').get()
    const analysts = snapshot.docs.map((doc) => {
      if (doc.data().enabled) return { ...doc.data(), id: doc.id }

      return null
    })
    dispatch(updateAllAnalysts(analysts))
    const checkAnalyst = analysts.find((analyst) => {
      return analyst.id === userData.email
    })
    dispatch(updateIsAnalyst(!!checkAnalyst))
  } catch (error) {
    console.log(error)
  }
}

const handleFirstLogin = (email, userState) => async (dispatch) => {
  await firebase
    .firestore()
    .collection('user_data')
    .doc(email)
    .get()
    .then((doc) => {
      if (doc && doc.data()) {
        dispatch(updateFirstLogin(doc.data().firstLogin))
      }
    })
}

const verify2FA = (userToken, userState) => async (dispatch) => {
  const response = await verifyGoogleAuth2FA(userToken)
  if (response.data.passed) {
    storage.set(
      T2FA_LOCAL_STORAGE,
      JSON.stringify({
        has2FADetails: userState.has2FADetails,
        is2FAVerified: true,
      })
    )
    dispatch(updateUserState({ ...userState, is2FAVerified: true }))
  }
  return response.data.passed
}

const delete2FA = (userToken, userState) => async (dispatch) => {
  await deleteGoogleAuth2FA(userToken)
  dispatch(
    updateUserState({
      ...userState,
      has2FADetails: null,
      is2FAVerified: true,
    })
  )
  storage.remove(T2FA_LOCAL_STORAGE)
}

const login =
  (email, password, userStoreData, appFlowData) => async (dispatch) => {
    const { userState, userData } = userStoreData
    const { isOnboardingSkipped, rememberCheck } = appFlowData
    const signedin = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code
        var errorMessage = error.message
        return { message: errorMessage, code: errorCode }
      })
    if (signedin.code) {
      return signedin
    }

    if (signedin) {
      if (!firebase.auth().currentUser.emailVerified) {
        const actionCodeSettings = {
          url:
            window.location.origin +
            '?email=' +
            firebase.auth().currentUser.email,
          handleCodeInApp: true,
        }
        const result = await firebase
          .auth()
          .currentUser.sendEmailVerification(actionCodeSettings)
          .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code
            var errorMessage = error.message
            return { message: errorMessage, code: errorCode }
          })

        if (result && result.code === 'auth/too-many-requests') {
          return { code: 'WAIT_RETRY' }
        }
        return { code: 'EVNEED' }
      }
    }

    // if we get the sign in
    if (signedin) {
      await validateUser()
      let has2FADetails = null
      dispatch(handleCountry())
      try {
        dispatch(getUserExchangesAfterFBInit(userData, isOnboardingSkipped))
        const response = await checkGoogleAuth2FA()
        has2FADetails = response.data
        storage.set(T2FA_LOCAL_STORAGE, JSON.stringify({ has2FADetails }))
      } catch (error) {}
      dispatch(
        updateUserState({ ...userState, user: signedin.user, has2FADetails })
      )
      storage.set('user', JSON.stringify(signedin.user))
      storage.set('remember', rememberCheck)
      await sendLoginInfo()
    }
    storage.remove('registered')
    return signedin
  }

const logout = () => async (dispatch) => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      const theme = storage.get('theme')
      storage.clear()
      if (theme) storage.set('theme', theme)
      session.clear()
      window.location = window.origin + '/login'
    })
    .catch((e) => {
      console.log(e)
    })
}

const add2FA = (t2faData, userState) => async (dispatch) => {
  const response = await saveGoogleAuth2FA({
    auth_answer: t2faData.auth_answer,
    key: t2faData.key,
    title: t2faData.title,
    description: t2faData.description,
    date: t2faData.date,
    type: t2faData.type,
  })
  if (!response?.data) {
    throw new Error('Error adding 2FA')
  }

  const has2FADetails = {
    title: t2faData.title,
    description: t2faData.description,
    date: t2faData.date,
    type: t2faData.type,
  }
  storage.set(
    T2FA_LOCAL_STORAGE,
    JSON.stringify({ has2FADetails, is2FAVerified: true })
  )
  dispatch(
    updateUserState({ ...userState, has2FADetails, is2FAVerified: true })
  )
  return response.data
}

const register = (email, password, userState) => async (dispatch) => {
  const registered = await firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code
      var errorMessage = error.message
      console.error({ message: errorMessage, code: errorCode })
      return { message: errorMessage, code: errorCode }
    })
  dispatch(updateUserState({ ...userState, registered: registered.user }))
  storage.set('registered', JSON.stringify(registered.user))

  return registered
}

export {
  updateUserData,
  updateUserContextLoaded,
  updateAllAnalysts,
  updateIsAnalyst,
  fetchAnalysts,
  updateUserState,
  add2FA,
  verify2FA,
  delete2FA,
  login,
  logout,
  register,
  handleFirstLogin,
}
