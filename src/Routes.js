import React from "react"
import { Switch, Route } from "react-router-dom"
import { Home, Users, About } from "./App"
import Login from "./views/Login"

const Routes = () => (
  <>
    {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
    <Switch>
      <Route path="/about">
        <About />
      </Route>
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/users">
        <Users />
      </Route>
      <Route path="/">
        <Home />
      </Route>
    </Switch>
  </>
)

export default Routes
