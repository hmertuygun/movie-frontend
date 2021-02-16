import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { Header } from './components'
import Routes from './Routes'
import UserContextProvider from './contexts/UserContext'
import TabContextProvider from './contexts/TabContext'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import OnboardingModal from './Trade/OnboardingModal'

library.add(fab, fas)
const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <UserContextProvider>
          <TabContextProvider>
            <Header />
            <Routes />
          </TabContextProvider>
        </UserContextProvider>
      </Router>
      {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}
