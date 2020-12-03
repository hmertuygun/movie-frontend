import React, { useContext, Fragment } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { UserContext } from './contexts/UserContext'

import TradeView from './views/TradeView'
import Login from './views/Login'
import Settings from './views/Settings'
import Position from './views/Position/PositionView'

const Routes = () => {
  const { isLoggedIn } = useContext(UserContext)

  return (
    <Switch>
      <Route path="/login">
        <Login />
      </Route>

      {isLoggedIn && (
        <Fragment>
          <Route path="/trade">
            <TradeView />
          </Route>

          <Route path="/settings" component={Settings}></Route>
          <Route path="/position" component={Position}></Route>
        </Fragment>
      )}

      {!isLoggedIn && <Redirect to="/login" />}
    </Switch>
  )
}

export default Routes
