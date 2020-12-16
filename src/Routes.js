import React, { useContext } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { UserContext } from './contexts/UserContext'

import TradeView from './views/TradeView'
import { About } from './views/About'
import Login from './views/Login'
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
          <Route path="/about" component={About} />
          <Route
            path="/logout"
            render={() => {
              setTimeout(() => {
                logout()
              }, 1000)

              return <div>Logging you out..</div>
            }}
          />

          <Route path="/settings" component={Settings} />
          <Route path="/portfolios" component={Portfolio} />
          <Route path="/positions" component={Position} />
          <Redirect to="/trade" />
        </Switch>
      )}

      <Route path="/login" component={Login} />
      {!isLoggedIn && <Redirect to="/login" />}
    </Switch>
  )
}

export default Routes
