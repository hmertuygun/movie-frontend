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
import FullScreenLoader from './components/FullScreenLoader'

library.add(fab, fas)
const queryClient = new QueryClient()

export default function App() {
  // const clearStorage = () => {
  //   let sr = window.sessionStorage.getItem('remember')
  //   let lr = window.localStorage.getItem('remember')
  //   console.log(sr, lr)
  //   if (!sr && lr !== "true") {
  //     window.localStorage.clear()
  //     window.sessionStorage.clear()
  //     initialState = { user: null, has2FADetails: null, is2FAVerified: false }
  //     //window.location.href = `${window.location.origin}/login`
  //   }
  //   window.sessionStorage.setItem('remember', true)
  // }
  // window.addEventListener('load', clearStorage)
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
