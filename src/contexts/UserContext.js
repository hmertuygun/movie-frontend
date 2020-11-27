import React, { createContext, useState } from 'react'
// import { firebase } from '../firebase/firebase'

export const UserContext = createContext()

const UserContextProvider = ({ children }) => {
  const localStorageUser = localStorage.getItem('user')
  let initialState = {}
  if (localStorageUser) {
    initialState = { user: JSON.parse(localStorageUser) }
  } else {
    initialState = { user: null }
  }
  const [state, setState] = useState(initialState)

  async function login(user) {
    setState(user)

    localStorage.setItem('user', JSON.stringify(user))
    return true
  }

  function logout() {
    setState(null)

    localStorage.clear('user')
    return true
  }

  const isUserLoggedIn = () => {
    return state && state.user ? true : false
  }

  const isLoggedIn = isUserLoggedIn()

  return (
    <UserContext.Provider
      value={{
        login,
        logout,
        isLoggedIn,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserContextProvider
