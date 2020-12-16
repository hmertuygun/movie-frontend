import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import Routes from './Routes'
import UserContextProvider from './contexts/UserContext'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <UserContextProvider>
          <Routes />
        </UserContextProvider>
      </Router>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
