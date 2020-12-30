import React, { createContext, useState } from 'react'
import { firebase } from '../firebase/firebase'
import { validateUser, verifyGoogleAuth2FA } from '../api/api'

export const UserContext = createContext()

const UserContextProvider = ({ children }) => {
  const localStorageUser = localStorage.getItem('user')
  let initialState = {}

  if (localStorageUser !== 'undefined') {
    initialState = { user: JSON.parse(localStorageUser) }
  } else {
    initialState = { user: null, is2faOnForUser: false, is2FAVerified: false }
  }

  const [state, setState] = useState(initialState)

  // @ TODO
  // Handle error
  // Unify responses
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

    // if we get the sign in
    if (signedin) {
      await validateUser()
      // TODO 2FA: check if user has 2FA enabled
      // const hasGoogle2FAuser = await firebase.firestore().collection('user_auth')
      //   .doc(signedin.user.email)
      //   .get()
      setState({ user: signedin.user, is2faOnForUser: false })
      localStorage.setItem('user', JSON.stringify(signedin.user))
    }

    localStorage.removeItem('registered')

    return signedin
  }

  async function verify2FA(userToken) {
    const response = await verifyGoogleAuth2FA(userToken)
    if (response.data.passed) {
      setState({ is2FAVerified: true })
    }

    return response.data.passed
  }

  // LOGOUT
  function logout() {
    localStorage.clear()
    setState({ user: null, is2FAVerified: false })
    return true
  }

  const isLoggedIn =
    state && state.user && (!state.is2faOnForUser || state.t2FAVerified)
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
        verify2FA,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserContextProvider
