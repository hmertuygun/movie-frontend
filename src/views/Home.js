import React from 'react'
import logo from './logo.svg'
import { TabNavigator } from '../components'

export function Home() {
  return (
    <div className="App">
      <TabNavigator labelArray={['Place Order', 'Full Trade']} index={1}>
        {[<div key={0}>hejjejjee</div>, <div key={1}>Bliieee bloo</div>]}
      </TabNavigator>

      <TabNavigator buttons labelArray={['Target', 'Stop-loss']} index={1}>
        {[<div key={0}>hejjejjee</div>, <div key={1}>Bliieee bloo</div>]}
      </TabNavigator>

      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}
