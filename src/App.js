import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { Header } from './components'
import Routes from './Routes'
import UserContextProvider from './contexts/UserContext'
import Alert from './components/Alert/Alert'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Alert />
        <UserContextProvider>
          <Header />
          <Routes />
        </UserContextProvider>
      </Router>
      {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}
