import React, { useContext } from 'react'
import { Route } from 'react-router-dom'
import { isMobile } from 'react-device-detect'

import TradePanel from './TradePanel'
import TradeChart from './TradeChart'
import { SymbolContextProvider } from './context/SymbolContext'
import { TabContext } from '../contexts/TabContext'
import SymbolSelect from './components/SymbolSelect/SymbolSelect'

import './TradeContainer.css'
import TradeOrders from './components/TradeOrders/TradeOrders'

const TradeContainer = () => {
  const { isTradePanelOpen } = useContext(TabContext)

  return (
    <SymbolContextProvider>
      {!isMobile ? (
        <>
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
            <section className="TradeOrders">
              <TradeOrders />
            </section>
          </section>
        </>
      ) : isTradePanelOpen ? (
        <section className="TradeView-Panel TradeView-Panel-Mobile">
          <Route path="/trade/" component={TradePanel} />
        </section>
      ) : (
        <section className="TradeChart-Container TradeChart-Container-Mobile">
          <section className="TradeView-Symbol">
            <SymbolSelect />
          </section>
          <section className="TradeView-Chart TradeView-Chart-Mobile">
            <TradeChart />
          </section>
          <section className="TradeOrders">
            <TradeOrders />
          </section>
        </section>
      )}
    </SymbolContextProvider>
  )
}

export default TradeContainer
