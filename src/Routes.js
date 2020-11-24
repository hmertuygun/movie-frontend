import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Home } from './views/Home'
import TradeView  from './views/TradeView'
import Login from './views/Login'

const Routes = () => (
  <Switch>
    <Route path="/trade">
      <TradeView />
    </Route>
    <Route path="/login">
      <Login />
    </Route>

    <Route exact path="/">
      <Home />
    </Route>
  </Switch>
)

export default Routes
