import React, { createContext, useState } from 'react'
import { firebase } from '../firebase/firebase'
import { validateUser } from '../api/api'

export const UserContext = createContext()

const UserContextProvider = ({ children }) => {
  const localStorageUser = localStorage.getItem('user')

  let initialState = {}
  console.log(localStorageUser)
  if (localStorageUser !== 'undefined') {
    initialState = { user: JSON.parse(localStorageUser) }
  } else {
    console.log('There was no localstorage')
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
      const validated = await validateUser()
      console.log(validated)
      setState({ user: signedin.user })
      localStorage.setItem('user', JSON.stringify(signedin.user))
    }

    return signedin
  }

  // LOGOUT
  function logout() {
    localStorage.clear('user')
    setState({ user: null })
    return true
  }

  // GET LOGGED IN STATE
  const isLoggedIn = state && state.user ? true : false

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
        // setError({ message: errorMessage, code: errorCode })
      })

    setState({ user: registered.user })
    localStorage.setItem('user', JSON.stringify(registered.user))

    return true
  }

  return (
    <UserContext.Provider
      value={{
        login,
        logout,
        register,
        isLoggedIn,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserContextProvider
