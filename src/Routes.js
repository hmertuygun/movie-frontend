import React, { useContext, useEffect, Suspense, lazy, useMemo } from 'react'
import {
  Switch,
  Route,
  Redirect,
  useHistory,
  useLocation,
} from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import { UserContext } from 'contexts/UserContext'
import NotificationsSystem, { useNotifications } from 'reapop'

import OnboardingModal from 'pages/Trade/OnboardingModal'
import SubscriptionModal from 'pages/Trade/SubscriptionModal'
import { trackPageView } from 'services/tracking'
import CacheRoute, { CacheSwitch } from 'react-router-cache-route'
import { Detector } from 'react-detect-offline'
import { customTheme } from 'styles'
import { pollingProp } from 'constants/positions'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from 'store/actions'
const Login = lazy(() => import('pages/Auth/QuickLogin'))
const LoginVerify2FA = lazy(() => import('pages/Auth/QuickLoginVerify2FA'))
const Register = lazy(() => import('pages/Auth/QuickRegister'))
const RegisterConfirm = lazy(() => import('pages/Auth/QuickRegisterConfirm'))
const RegisterFinal = lazy(() => import('pages/Auth/QuickFinal'))
const RecoverPassword = lazy(() => import('pages/Auth/RecoverPassword'))
const NewPassword = lazy(() => import('pages/Auth/NewPassword'))
const HandleEmailActions = lazy(() => import('pages/Auth/HandleEmailActions'))
const Plans = lazy(() => import('./pages/Auth/Plans'))
const TradeView = lazy(() => import('pages/Trade'))
const Settings = lazy(() => import('pages/Settings'))
const Portfolio = lazy(() => import('pages/Portfolio'))
const Analytics = lazy(() => import('pages/Analytics'))
const PriceAlerts = lazy(() => import('pages/PriceAlerts'))
const Academy = lazy(() => import('pages/Academy'))
const Market = lazy(() => import('pages/Market'))

const Routes = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` })
  const { notifications, dismissNotification } = useNotifications()
  const { notify } = useNotifications()
  const { isLoggedIn } = useContext(UserContext)
  const [isSettingsPage, isTradePage, isLocalEnv] = useMemo(() => {
    return [
      pathname === '/settings',
      pathname === '/trade',
      !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
    ]
  }, [pathname])

  const { loadApiKeys, isApiKeysLoading } = useSelector(
    (state) => state.apiKeys
  )
  const { userContextLoaded, userState, firstLogin } = useSelector(
    (state) => state.users
  )
  const { isOnboardingSkipped, showSubModalIfLessThan7Days } = useSelector(
    (state) => state.appFlow
  )
  const { hasSub, subscriptionData } = useSelector(
    (state) => state.subscriptions
  )

  const [need2FA, needPlans, needLoading, needOnboarding, needSubModal] =
    useMemo(() => {
      return [
        (isLoggedIn && !isApiKeysLoading && loadApiKeys && !userState) ||
          (isLoggedIn &&
            !isApiKeysLoading &&
            loadApiKeys &&
            !userState.has2FADetails),
        isLoggedIn && userState && firstLogin,
        isTradePage && isLoggedIn && isApiKeysLoading && !userContextLoaded,
        isLoggedIn &&
          userContextLoaded &&
          !loadApiKeys &&
          !isSettingsPage &&
          !isOnboardingSkipped &&
          !firstLogin &&
          hasSub &&
          !isApiKeysLoading,
        isLoggedIn &&
          userContextLoaded &&
          subscriptionData &&
          !isSettingsPage &&
          !firstLogin &&
          (!hasSub || showSubModalIfLessThan7Days),
      ]
    }, [
      hasSub,
      isApiKeysLoading,
      isLoggedIn,
      loadApiKeys,
      userState,
      userContextLoaded,
      showSubModalIfLessThan7Days,
      isOnboardingSkipped,
      isTradePage,
      isSettingsPage,
      firstLogin,
    ])

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
    if (need2FA) {
      history.push('/settings#security')
    }
    if (needPlans) {
      history.push('/plans')
    }
  }, [need2FA, needPlans])

  useEffect(() => {
    trackPageView()
    history.listen(trackPageView)
  }, [history])

  return (
    <div style={{ paddingBottom: isMobile ? '65px' : '' }}>
      <NotificationsSystem
        notifications={notifications}
        dismissNotification={(id) => dismissNotification(id)}
        theme={customTheme}
      />

      <Detector
        polling={{
          url: pollingProp.url,
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
                dispatch(logout())
                return (
                  <div className="d-flex justify-content-center">
                    <h3 className="mt-5">Logging you out..</h3>
                  </div>
                )
              }}
            />
          )}

          {needOnboarding && <OnboardingModal />}

          {needLoading && (
            <p
              className="d-flex justify-content-center align-items-center"
              style={{ height: 'calc(100vh - 150px)' }}
            >
              Loading your chart...
            </p>
          )}

          {needSubModal && <SubscriptionModal />}

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
              {firstLogin && <CacheRoute path="/plans" component={Plans} />}
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
