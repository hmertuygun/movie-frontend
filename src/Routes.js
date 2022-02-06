import React, { useContext, useEffect, Suspense, lazy } from 'react'
import {
  Switch,
  Route,
  Redirect,
  useHistory,
  useLocation,
} from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import { UserContext } from './contexts/UserContext'
import NotificationsSystem, { useNotifications } from 'reapop'

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
// import Positions from './views/PositionView'
// import Portfolio from './views/PortfolioView'
// import PriceAlerts from './views/PriceAlertView'
import OnboardingModal from './Trade/OnboardingModal'
import SubscriptionModal from './Trade/SubscriptionModal'
import FullScreenLoader from './components/FullScreenLoader'
import { PageView } from './Tracking'
import CacheRoute, { CacheSwitch } from 'react-router-cache-route'
import { Detector } from 'react-detect-offline'
import { customTheme } from './customTheme'

const Login = lazy(() => import('./views/Auth/QuickLogin'))
const LoginVerify2FA = lazy(() => import('./views/Auth/QuickLoginVerify2FA'))
const Register = lazy(() => import('./views/Auth/QuickRegister'))
const RegisterTwo = lazy(() => import('./views/Auth/QuickRegisterTwo'))
const RegisterThree = lazy(() => import('./views/Auth/QuickRegisterThree'))
const RegisterConfirm = lazy(() => import('./views/Auth/QuickRegisterConfirm'))
const RegisterFinal = lazy(() => import('./views/Auth/QuickFinal'))
const RecoverPassword = lazy(() => import('./views/Auth/RecoverPassword'))
const NewPassword = lazy(() => import('./views/Auth/NewPassword'))
const HandleEmailActions = lazy(() => import('./views/Auth/HandleEmailActions'))

const TradeView = lazy(() => import('./views/TradeView'))
const Settings = lazy(() => import('./views/Settings'))
const Portfolio = lazy(() => import('./views/PortfolioView'))
const Analytics = lazy(() => import('./views/Analytics'))
const PriceAlerts = lazy(() => import('./views/PriceAlertView'))
const Academy = lazy(() => import('./views/Academy'))
const Market = lazy(() => import('./views/Market'))

const Routes = () => {
  const history = useHistory()
  const { pathname } = useLocation()
  const isSettingsPage = pathname === '/settings'
  const isTradePage = pathname === '/trade'
  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` })
  const { notifications, dismissNotification } = useNotifications()

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
    showSubModalIfLessThan7Days,
    isOnboardingSkipped,
    isApiKeysLoading,
    state,
  } = useContext(UserContext)
  const { notify } = useNotifications()

  const showNotifOnNetworkChange = (online) => {
    if (online) {
      notify({
        id: 'back-online',
        status: 'success',
        title: 'Success',
        message: 'You are back online!',
      })
    } else {
      notify({
        id: 'not-online',
        status: 'warning',
        title: 'Warning',
        message: "You don't seem to be online anymore!",
      })
    }
    return null
  }

  useEffect(() => {
    if (
      (isLoggedIn && !isApiKeysLoading && loadApiKeys && !state) ||
      (isLoggedIn && !isApiKeysLoading && loadApiKeys && !state.has2FADetails)
    ) {
      history.push('/settings#security')
    }
  }, [
    state,
    isLoggedIn,
    isApiKeysLoading,
    history.location.pathname,
    loadApiKeys,
  ])

  const isLocalEnv = window.location.hostname === 'localhost'
  return (
    <div style={{ paddingBottom: isMobile ? '80px' : '' }}>
      <NotificationsSystem
        notifications={notifications}
        dismissNotification={(id) => dismissNotification(id)}
        theme={customTheme}
      />
      {/* <FullScreenLoader /> */}
      <Detector
        polling={{
          url: 'https://jsonplaceholder.typicode.com/posts/1',
          enabled: isLoggedIn && !isLocalEnv,
        }}
        onChange={(e) => {
          showNotifOnNetworkChange(e)
        }}
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

          {isLoggedIn &&
            userContextLoaded &&
            !loadApiKeys &&
            !isSettingsPage &&
            !isOnboardingSkipped &&
            !isApiKeysLoading && <OnboardingModal />}
          {isTradePage && isLoggedIn && isApiKeysLoading && (
            <p
              className="d-flex justify-content-center align-items-center"
              style={{ height: 'calc(100vh - 150px)' }}
            >
              Loading your chart...
            </p>
          )}
          {/* {isLoggedIn && !state.has2FADetails && (
            <Route path="/settings#security" component={Settings} />
          )} */}
          {isLoggedIn &&
            userContextLoaded &&
            !isSettingsPage &&
            (!hasSub || showSubModalIfLessThan7Days) && <SubscriptionModal />}
          {isLoggedIn && userContextLoaded && (
            <CacheSwitch>
              <Route path="/settings" component={Settings} />
              {!isOnboardingSkipped && (
                <CacheRoute path="/portfolio" component={Portfolio} />
              )}
              {!isOnboardingSkipped && (
                <CacheRoute exact path="/trade" component={TradeView} />
              )}
              {!isOnboardingSkipped && (
                <CacheRoute path="/alerts" component={PriceAlerts} />
              )}
              {!isOnboardingSkipped && (
                <CacheRoute path="/analytics" component={Analytics} />
              )}
              {!isOnboardingSkipped && (
                <CacheRoute path="/academy" component={Academy} />
              )}
              <CacheRoute path="/market" component={Market} />

              <Redirect to="/market" />
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
          <Route exact path="/chartmirroring" component={RegisterTwo} />
          <Route exact path="/bybit" component={RegisterThree} />
          <Route exact path="/register/confirm" component={RegisterConfirm} />
          <Route exact path="/academy" component={Academy} />
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
