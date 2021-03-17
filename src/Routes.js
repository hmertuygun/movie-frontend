import React, { useContext, useState, useEffect } from 'react'
import { Switch, Route, Redirect, useHistory } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive';
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
import OnboardingModal from './Trade/OnboardingModal'
import FullScreenLoader from './components/FullScreenLoader'
import { PageView } from './Tracking'

const Routes = () => {
  const history = useHistory()
  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` });

  useEffect(() => {
    PageView()
    history.listen(PageView)
  }, [history])

  const { isLoggedIn, logout, userContextLoaded, loadApiKeys, loaderVisible, loaderText } = useContext(UserContext)
  return (
    <div style={{paddingBottom: isMobile? '80px': ''}}>
      <FullScreenLoader />
      <Switch>
        {isLoggedIn && userContextLoaded && (
          <Route
            path="/logout"
            render={() => {
              logout()
              return <div>Logging you out..</div>
            }}
          />
        )}
        {isLoggedIn && userContextLoaded && !loadApiKeys && <OnboardingModal />}
        {isLoggedIn && userContextLoaded && (
          <Switch>
            <Route path="/trade" component={TradeView} />
            <Route path="/settings" component={Settings} />
            <Route path="/portfolio" component={Portfolio} />
            <Route path="/positions" component={Position} />
            <Redirect to="/trade" />
          </Switch>
        )}
        <Route path="/login/verify2fa" component={LoginVerify2FA} />
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
