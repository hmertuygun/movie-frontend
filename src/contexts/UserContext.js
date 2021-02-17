import React, { createContext, useState, useEffect } from 'react'
import { firebase } from '../firebase/firebase'
import {
  checkGoogleAuth2FA,
  deleteGoogleAuth2FA,
  saveGoogleAuth2FA,
  validateUser,
  verifyGoogleAuth2FA,
  getUserExchanges,
  updateLastSelectedAPIKey
} from '../api/api'
export const UserContext = createContext()
const T2FA_LOCAL_STORAGE = '2faUserDetails'
const UserContextProvider = ({ children }) => {
  const localStorageUser = localStorage.getItem('user')
  const localStorage2faUserDetails = localStorage.getItem(T2FA_LOCAL_STORAGE)
  let initialState = {}

  if (localStorageUser !== 'undefined') {
    initialState = {
      user: JSON.parse(localStorageUser),
      ...JSON.parse(localStorage2faUserDetails),
    }
  } else {
    initialState = { user: null, has2FADetails: null, is2FAVerified: false }
  }
  const [state, setState] = useState(initialState)
  const [loadApiKeys, setLoadApiKeys] = useState(false)
  const [hasToken, setHasToken] = useState(false)
  const [userContextLoaded, setUserContextLoaded] = useState(false)
  const [totalExchanges, setTotalExchanges] = useState([])
  const [activeExchange, setActiveExchange] = useState({ apiKeyName: '', exchange: '' })
  // @ TODO
  // Handle error
  // Unify responses

  async function getExchanges() {
    try {
      const hasKeys = await getUserExchanges()
      if (!hasKeys?.data?.apiKeys?.length) {
        setUserContextLoaded(true)
        return
      }
      const { apiKeys } = hasKeys.data
      setTotalExchanges(apiKeys)
      let activeKey = apiKeys.find(item => item.isLastSelected === true && item.status === "Active")
      if (activeKey) {
        setLoadApiKeys(true) // Only check active api exchange eventually
        setActiveExchange({ apiKeyName: activeKey.apiKeyName, exchange: activeKey.exchange })
      }
      else {
        // find the first one that is 'Active'
        let active = apiKeys.find(item => item.status === "Active")
        if (active) {
          await updateLastSelectedAPIKey({ ...active })
          setActiveExchange({ ...active })
          setLoadApiKeys(true)
        }
      }
    }
    catch (e) {
      console.log(e)
    }
    finally {
      setUserContextLoaded(true)
    }
  }

  const getUserExchangesAfterFBInit = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        setHasToken(true)
        getExchanges()
      }
      else {
        // User is signed out.
      }
    })
  }

  useEffect(() => {
    getUserExchangesAfterFBInit()
  }, [])

  async function login(email, password) {
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
        setState('registered', firebase.auth().currentUser)
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
      try {
        getUserExchangesAfterFBInit()
        const response = await checkGoogleAuth2FA()
        has2FADetails = response.data
        localStorage.setItem(
          T2FA_LOCAL_STORAGE,
          JSON.stringify({ has2FADetails })
        )
      } catch (error) { }
      setState({ user: signedin.user, has2FADetails })
      localStorage.setItem('user', JSON.stringify(signedin.user))
    }

    localStorage.removeItem('registered')

    return signedin
  }

  async function add2FA(t2faData) {
    const response = await saveGoogleAuth2FA({
      auth_answer: t2faData.auth_answer,
      key: t2faData.key,
      title: t2faData.title,
      description: t2faData.description,
      date: t2faData.date,
      type: t2faData.type,
    })
    const has2FADetails = {
      title: t2faData.title,
      description: t2faData.description,
      date: t2faData.date,
      type: t2faData.type,
    }
    localStorage.setItem(
      T2FA_LOCAL_STORAGE,
      JSON.stringify({ has2FADetails, is2FAVerified: true })
    )
    setState({ ...state, has2FADetails, is2FAVerified: true })
    return response.data
  }

  function get2FADetails() {
    return state.has2FADetails
  }

  async function verify2FA(userToken) {
    const response = await verifyGoogleAuth2FA(userToken)
    if (response.data.passed) {
      localStorage.setItem(
        T2FA_LOCAL_STORAGE,
        JSON.stringify({
          has2FADetails: state.has2FADetails,
          is2FAVerified: true,
        })
      )
      setState({ ...state, is2FAVerified: true })
    }

    return response.data.passed
  }

  async function delete2FA(userToken) {
    await deleteGoogleAuth2FA(userToken)
    setState({ ...state, has2FADetails: null, is2FAVerified: true })
    localStorage.removeItem(T2FA_LOCAL_STORAGE)
  }

  // LOGOUT
  function logout() {
    localStorage.clear()
    setState({ user: null, has2FADetails: null, is2FAVerified: false })
    return true
  }

  const isLoggedIn = state && state.user && (!state.has2FADetails || state.is2FAVerified)
  const isLoggedInWithFirebase = state && state.user
  // REGISTER NEW USER
  async function register(email, password) {
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

    setState({ registered: registered.user })
    localStorage.setItem('registered', JSON.stringify(registered.user))

    return registered
  }

  async function sendEmailAgain() {
    if (state.registered) {
      const actionCodeSettings = {
        url:
          window.location.origin +
          '?email=' +
          firebase.auth().currentUser.email,
        handleCodeInApp: true,
      }

      firebase.auth().currentUser.sendEmailVerification(actionCodeSettings)
    } else {
      console.log('no registered')
    }
  }

  async function isRegistered() {
    try {
      return await JSON.parse(localStorage.getItem('registered'))
    } catch (error) {
      console.error(error)
      return {
        message: 'Not registered',
      }
    }
  }

  return (
    <UserContext.Provider
      value={{
        login,
        logout,
        register,
        isRegistered,
        isLoggedIn,
        isLoggedInWithFirebase,
        add2FA,
        verify2FA,
        get2FADetails,
        delete2FA,
        sendEmailAgain,
        setLoadApiKeys,
        loadApiKeys,
        activeExchange,
        setActiveExchange,
        userContextLoaded,
        totalExchanges,
        setTotalExchanges
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserContextProvider
