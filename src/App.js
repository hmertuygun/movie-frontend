import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import ChunkLoadErrorBoundary from './components/ChunkLoadErrorBoundary'
import ErrorBoundary from './components/ErrorBoundary'
import Routes from './Routes'
import ThemeContextProvider from './contexts/ThemeContext'
import UserContextProvider from './contexts/UserContext'
import TabContextProvider from './contexts/TabContext'
import SymbolContextProvider from './Trade/context/SymbolContext'
import PositionCTXProvider from './Position/context/PositionContext'
import PortfolioCTXProvider from './Portfolio/context/PortfolioContext'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { initGA } from './Tracking'

initGA(process.env.REACT_APP_TRACKING_ID)

const Header = lazy(() => import('./components/Header/Header'))

library.add(fab, fas)
const queryClient = new QueryClient()

export default function App() {
  return (
    <ChunkLoadErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ThemeContextProvider>
            <UserContextProvider>
              <PortfolioCTXProvider>
                <SymbolContextProvider>
                  <TabContextProvider>
                    <PositionCTXProvider>
                      <ErrorBoundary componentName="Header">
                        <Suspense fallback={<div></div>}>
                          <Header />
                        </Suspense>
                      </ErrorBoundary>
                      <Routes />
                    </PositionCTXProvider>
                  </TabContextProvider>
                </SymbolContextProvider>
              </PortfolioCTXProvider>
            </UserContextProvider>
          </ThemeContextProvider>
        </Router>
        {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ChunkLoadErrorBoundary>
  )
}
