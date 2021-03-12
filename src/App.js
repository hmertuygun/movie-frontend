import React, { useEffect } from 'react'
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
import FullScreenLoader from './components/FullScreenLoader'
import { initGA } from './Tracking'

library.add(fab, fas)
const queryClient = new QueryClient()

export default function App() {
  useEffect(() => {
    initGA(process.env.REACT_APP_TRACKING_ID)
  }, [])

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
