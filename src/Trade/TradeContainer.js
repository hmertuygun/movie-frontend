import React from 'react'
import { Route } from 'react-router-dom'
import TradePanel from './TradePanel'
import TradeChart from './TradeChart'
import { SymbolContextProvider } from './context/SymbolContext'
import SymbolSelect from './components/SymbolSelect/SymbolSelect'

import './TradeContainer.css'
import TradeHistory from './components/TradeHistory/TradeHistory'

const TradeContainer = () => (
  <SymbolContextProvider>
    <section className="TradeView-Panel">
      <Route path="/trade/" component={TradePanel} />
    </section>

    <section className="TradeChart-Container">
      <section className="TradeView-Symbol">
        <SymbolSelect />
      </section>
      <section className="TradeView-Chart">
        <TradeChart />
      </section>
      <section style={{ height: '50vh' }}>
        <TradeHistory />
      </section>
    </section>
  </SymbolContextProvider>
)

export default TradeContainer
