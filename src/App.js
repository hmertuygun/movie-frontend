import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import Routes from './Routes'
import UserContextProvider from './contexts/UserContext'

export default function App() {
  return (
    <Router>
      <UserContextProvider>
        <Routes />
      </UserContextProvider>
    </Router>
  )
}
