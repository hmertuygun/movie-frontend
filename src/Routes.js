import React, { useContext, Fragment } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { UserContext } from './contexts/UserContext'

import { Home } from './views/Home'
import TradeView from './views/TradeView'
import Login from './views/Login'

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

          <Redirect to="/trade"></Redirect>
        </Fragment>
      )}

      {!isLoggedIn && <Redirect to="/login" />}
    </Switch>
  )
}

export default Routes
