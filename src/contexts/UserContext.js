import React, { createContext, useState } from 'react'
import { authenticator } from 'otplib'
import { firebase } from '../firebase/firebase'
import { validateUser } from '../api/api'

export const tmpLocalStorageKey2FA = 'Demo2FAEntry'

export const UserContext = createContext()

const UserContextProvider = ({ children }) => {
  const localStorageUser = localStorage.getItem('user')
  let initialState = {}

  if (localStorageUser !== 'undefined') {
    initialState = { user: JSON.parse(localStorageUser) }
  } else {
    initialState = { user: null }
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
      setState({ user: signedin.user })
      localStorage.setItem('user', JSON.stringify(signedin.user))
    }

    localStorage.removeItem('registered')

    return signedin
  }

  // @ TODO
  // Handle error
  // Unify responses
  async function verify2FA(userToken) {
    // TODO: Secrect needs to be fetched from BE
    const secret = localStorage.getItem(tmpLocalStorageKey2FA)
    const verified = authenticator.verify({
      token: userToken,
      secret,
    })
    if (verified) {
      const verifiedUser = { ...state.user, t2FAVerified: true }
      setState({ user: verifiedUser })
      localStorage.setItem('user', JSON.stringify(verifiedUser))
    }

    return verified
  }

  // LOGOUT
  function logout() {
    localStorage.clear()
    setState({ user: null })
    return true
  }

  // GET LOGGED IN STATE
  const is2faOnForUser = localStorage.getItem(tmpLocalStorageKey2FA)
  const isLoggedIn =
    state && state.user && (!is2faOnForUser || state.user.t2FAVerified)
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
