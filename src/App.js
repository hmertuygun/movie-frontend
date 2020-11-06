import './App.css'
import React from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'
import Routes from './Routes'

export default function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </nav>

        <Routes />
      </div>
    </Router>
  )
}
