import React, { useContext, useState, useEffect, Suspense, lazy } from 'react'
import {
  Switch,
  Route,
  Redirect,
  useHistory,
  useLocation,
} from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import { UserContext } from './contexts/UserContext'

// import Login from './views/Auth/QuickLogin'
// import LoginVerify2FA from './views/Auth/QuickLoginVerify2FA'
// import Register from './views/Auth/QuickRegister'
// import RegisterConfirm from './views/Auth/QuickRegisterConfirm'
// import RegisterFinal from './views/Auth/QuickFinal'
// import RecoverPassword from './views/Auth/RecoverPassword'
// import NewPassword from './views/Auth/NewPassword'
// import HandleEmailActions from './views/Auth/HandleEmailActions'

// import TradeView from './views/TradeView'
// import Settings from './views/Settings'
import Positions from './views/PositionView'
import Portfolio from './views/PortfolioView'
// import PriceAlerts from './views/PriceAlertView'


import OnboardingModal from './Trade/OnboardingModal'
import SubscriptionModal from './Trade/SubscriptionModal'
import FullScreenLoader from './components/FullScreenLoader'
import { PageView } from './Tracking'
import CacheRoute, { CacheSwitch } from 'react-router-cache-route'
import { Detector, Offline, Online } from 'react-detect-offline'
import { successNotification, warningNotification } from './components/Notifications'

const Login = lazy(() => import('./views/Auth/QuickLogin'))
const LoginVerify2FA = lazy(() => import('./views/Auth/QuickLoginVerify2FA'))
const Register = lazy(() => import('./views/Auth/QuickRegister'))
const RegisterConfirm = lazy(() => import('./views/Auth/QuickRegisterConfirm'))
const RegisterFinal = lazy(() => import('./views/Auth/QuickFinal'))
const RecoverPassword = lazy(() => import('./views/Auth/RecoverPassword'))
const NewPassword = lazy(() => import('./views/Auth/NewPassword'))
const HandleEmailActions = lazy(() => import('./views/Auth/HandleEmailActions'))

const TradeView = lazy(() => import('./views/TradeView'))
const Settings = lazy(() => import('./views/Settings'))
// const Positions = lazy(() => import('./views/PositionView'))
// const Portfolio = lazy(() => import('./views/PortfolioView'))
const PriceAlerts = lazy(() => import('./views/PriceAlertView'))

const Routes = () => {
  const history = useHistory()
  const { pathname } = useLocation()
  const isSettingsPage = pathname === '/settings'
  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` })

  useEffect(() => {
    PageView()
    history.listen(PageView)
  }, [history])

  const {
    isLoggedIn,
    logout,
    userContextLoaded,
    loadApiKeys,
    hasSub,
    loaderVisible,
    loaderText,
    setIsAppOnline,
    showSubModalIfLessThan7Days
  } = useContext(UserContext)

  const showNotifOnNetworkChange = (online) => {
    if (online) {
      successNotification.open({ description: "You are back online!" })
    }
    else {
      warningNotification.open({ description: "You don't seem to be online anymore!" })
    }
    return null
  }

  const isLocalEnv = window.location.hostname === "localhost"
  return (
    <div style={{ paddingBottom: isMobile ? '80px' : '' }}>
      <FullScreenLoader />
      <Detector
        polling={{ url: "https://jsonplaceholder.typicode.com/posts/1", enabled: isLoggedIn && !isLocalEnv }}
        onChange={(e) => { showNotifOnNetworkChange(e) }}
        render={({ online }) => {
          return null
        }}
      />
      <Suspense fallback={<div></div>}>
        <Switch>
          {isLoggedIn && userContextLoaded && (
            <Route
              path="/logout"
              render={() => {
                logout()
                return (
                  <div className="d-flex justify-content-center">
                    <h3 className="mt-5">Logging you out..</h3>
                  </div>
                )
              }}
            />
          )}
          {isLoggedIn && userContextLoaded && !loadApiKeys && !isSettingsPage && <OnboardingModal />}
          {isLoggedIn && userContextLoaded && !isSettingsPage && (!hasSub || showSubModalIfLessThan7Days) && (
            <SubscriptionModal />
          )}
          {isLoggedIn && userContextLoaded && (
            <CacheSwitch>
              <CacheRoute exact path="/trade" component={TradeView} />
              <Route path="/settings" component={Settings} />
              <CacheRoute path="/portfolio" component={Portfolio} />
              <CacheRoute path="/alerts" component={PriceAlerts} />
              <CacheRoute path="/positions" component={Positions} />
              <Redirect to="/trade" />
            </CacheSwitch>
          )}
          {userContextLoaded && (
            <Route path="/login/verify2fa" component={LoginVerify2FA} />
          )}
          <Route path="/login" component={Login} />
          <Route path="/recover-password" component={RecoverPassword} />
          <Route path="/new-password" component={NewPassword} />
          <Route path="/action" component={HandleEmailActions} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/register/confirm" component={RegisterConfirm} />
          <Route
            exact
            path="/register/confirm/recieved"
            component={RegisterFinal}
          />
          {!isLoggedIn && <Redirect to="/login" />}
        </Switch>
      </Suspense>
    </div>
  )
}

export default Routes
