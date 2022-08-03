import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { ChunkLoadErrorBoundary } from 'components'
import ErrorBoundary from 'components/ErrorBoundary'
import Routes from './Routes'
import ThemeContextProvider from 'contexts/ThemeContext'
import UserContextProvider from 'contexts/UserContext'
import TabContextProvider from 'contexts/TabContext'
import SymbolContextProvider from 'contexts/SymbolContext'
import { setUpNotifications } from 'reapop'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { initTracking } from 'services/tracking'
import WarningAlert from 'components/WarningAlert'
import Notification from 'components/Notification'

initTracking(process.env.REACT_APP_TRACKING_ID)

const Header = lazy(() => import('components/Header/Header'))

library.add(fab, fas)
const queryClient = new QueryClient()

export default function App() {
  setUpNotifications({
    defaultProps: {
      position: 'bottom-right',
      dismissible: true,
      showDismissButton: true,
      dismissAfter: 5000,
    },
  })
  return (
    <ChunkLoadErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ThemeContextProvider>
            <UserContextProvider>
              <SymbolContextProvider>
                <TabContextProvider>
                  <ErrorBoundary componentName="Header">
                    <Suspense fallback={<div></div>}>
                      <Header />
                    </Suspense>
                  </ErrorBoundary>
                  <WarningAlert />
                  <Notification />
                  <Routes />
                </TabContextProvider>
              </SymbolContextProvider>
            </UserContextProvider>
          </ThemeContextProvider>
        </Router>
        {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ChunkLoadErrorBoundary>
  )
}
