import React from 'react'
import { Route } from 'react-router-dom'
import TradePanel from '../Trade/TradePanel'
import './TradeView.css'

const TradeView = () => (
  <main className="TradeView-Container">
    <section className="TradeView-Panel">
      <Route path="/trade/" component={TradePanel} />
    </section>
    <section className="TradeView-Chart"></section>
  </main>
)

export default TradeView



