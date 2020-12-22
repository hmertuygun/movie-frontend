import React, { createContext, useState } from 'react'
import { firebase } from '../firebase/firebase'
import { validateUser } from '../api/api'

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

    localStorage.clear('registered')

    return signedin
  }

  // LOGOUT
  function logout() {
    localStorage.clear('user')
    localStorage.clear('registered')
    setState({ user: null })
    return true
  }

  // GET LOGGED IN STATE
  const isLoggedIn = state && state.user

  // REGISTER NEW USER
  async function register(email, password) {
    console.log(email, password)

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
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserContextProvider
