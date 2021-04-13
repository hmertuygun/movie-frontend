import React, { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { Header } from './components'
import Routes from './Routes'
import UserContextProvider from './contexts/UserContext'
import TabContextProvider from './contexts/TabContext'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import FullScreenLoader from './components/FullScreenLoader'
import { initGA } from './Tracking'
initGA(process.env.REACT_APP_TRACKING_ID)
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

library.add(fab, fas)
const queryClient = new QueryClient()

export default function App() {
  return (
    <Sentry.ErrorBoundary fallback={'An error has occurred'}>
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
    </Sentry.ErrorBoundary>
  )
}
