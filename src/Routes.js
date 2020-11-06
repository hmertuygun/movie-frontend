import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Home } from './views/Home'
import { About } from './views/About'
import Login from './views/Login'

const Routes = () => (
  <Switch>
    <Route path="/about">
      <About />
    </Route>
    <Route path="/login">
      <Login />
    </Route>

    <Route path="/">
      <Home />
    </Route>
  </Switch>
)

export default Routes
