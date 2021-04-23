import React, { useContext, useState, useEffect } from 'react'
import { Switch, Route, Redirect, useHistory, useLocation } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import { UserContext } from './contexts/UserContext'

import Login from './views/Auth/QuickLogin'
import LoginVerify2FA from './views/Auth/QuickLoginVerify2FA'
import Register from './views/Auth/QuickRegister'
import RegisterConfirm from './views/Auth/QuickRegisterConfirm'
import RegisterFinal from './views/Auth/QuickFinal'
import RecoverPassword from './views/Auth/RecoverPassword'
import NewPassword from './views/Auth/NewPassword'
import HandleEmailActions from './views/Auth/HandleEmailActions'

import TradeView from './views/TradeView'
import Settings from './views/Settings'
import Position from './views/PositionView'
import Portfolio from './views/PortfolioView'
import PriceAlerts from './views/PriceAlertView'
import OnboardingModal from './Trade/OnboardingModal'
import SubscriptionModal from './Trade/SubscriptionModal'
import FullScreenLoader from './components/FullScreenLoader'
import { PageView } from './Tracking'
import CacheRoute, { CacheSwitch } from 'react-router-cache-route'

const Routes = () => {
  const history = useHistory()
  const { pathname } = useLocation()
  const isSettingsPage = pathname === "/settings"
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
  } = useContext(UserContext)
  return (
    <div style={{ paddingBottom: isMobile ? '80px' : '' }}>
      <FullScreenLoader />
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
        {isLoggedIn && userContextLoaded && !loadApiKeys && <OnboardingModal />}
        {/* {isLoggedIn && userContextLoaded && !hasSub && !isSettingsPage && (
          <SubscriptionModal />
        )} */}
        {isLoggedIn && userContextLoaded && (
          <CacheSwitch>
            {/* className={`${!hasSub ? 'grayscale' : ''}`} */}
            <CacheRoute exact path="/trade" component={TradeView} />
            <Route path="/settings" component={Settings} />
            <CacheRoute path="/portfolio" component={Portfolio} />
            <CacheRoute path="/alerts" component={PriceAlerts} />
            <CacheRoute path="/positions" component={Position} />
            <Redirect to="/trade" />
          </CacheSwitch>
        )}
        {userContextLoaded && <Route path="/login/verify2fa" component={LoginVerify2FA} />}
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
        {!isLoggedIn && <Redirect to="/register" />}
      </Switch>
    </div>
  )
}

export default Routes
