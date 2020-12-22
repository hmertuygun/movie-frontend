import React, { useContext } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { UserContext } from './contexts/UserContext'

import Login from './views/Auth/QuickLogin'
import Register from './views/Auth/QuickRegister'
import RegisterConfirm from './views/Auth/QuickRegisterConfirm'
import RegisterFinal from './views/Auth/QuickFinal'

import TradeView from './views/TradeView'
import Settings from './views/Settings'
import Position from './views/PositionView'
import Portfolio from './views/PortfolioView'

const Routes = () => {
  const { isLoggedIn, logout } = useContext(UserContext)

  return (
    <Switch>
      {isLoggedIn && (
        <Switch>
          <Route path="/trade" component={TradeView} />

          <Route
            path="/logout"
            render={() => {
              logout()

              return <div>Logging you out..</div>
            }}
          />

          <Route path="/settings" component={Settings} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/positions" component={Position} />
          <Redirect to="/trade" />
        </Switch>
      )}

      <Route path="/login" component={Login} />
      <Route exact path="/register" component={Register} />
      <Route exact path="/register/confirm" component={RegisterConfirm} />
      <Route
        exact
        path="/register/confirm/recieved"
        component={RegisterFinal}
      />
      {!isLoggedIn && <Redirect to="/login" />}
    </Switch>
  )
}

export default Routes
