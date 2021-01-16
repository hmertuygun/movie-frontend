import React from 'react'
import { Route } from 'react-router-dom'
import TradePanel from './TradePanel'
import TradeChart from './TradeChart'
import { SymbolContextProvider } from './context/SymbolContext'
import SymbolSelect from './components/SymbolSelect/SymbolSelect'

import './TradeContainer.css'

const TradeContainer = () => (
  <SymbolContextProvider>
    {/* Dark class as long as we dont have dark theme for all components  */}
    <section className="TradeView-Panel dark">
      <Route path="/trade/" component={TradePanel} />
    </section>

    <section className="TradeChart-Container">
      <section className="TradeView-Symbol">
        <SymbolSelect />
      </section>
      <section className="TradeView-Chart">
        <TradeChart />
      </section>
    </section>
  </SymbolContextProvider>
)

export default TradeContainer
