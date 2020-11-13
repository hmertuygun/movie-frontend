import React, { Fragment } from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'
import Routes from './Routes'

export default function App() {
  return (
    <Router>
      <Fragment>
        <header>
          <nav>
            <ul>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/trade">Trade</Link>
              </li>
            </ul>
          </nav>
        </header>

        <Routes />

      </Fragment>
    </Router>
  )
}
