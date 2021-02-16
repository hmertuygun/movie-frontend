import React, { useEffect, useContext } from 'react'
import { Route } from 'react-router-dom'
import { isMobile } from 'react-device-detect'
import { useHistory } from 'react-router-dom'

import TradePanel from './TradePanel'
import TradeChart from './TradeChart'
import { SymbolContextProvider } from './context/SymbolContext'
import { TabContext } from '../contexts/TabContext'
import { UserContext } from '../contexts/UserContext'
import SymbolSelect from './components/SymbolSelect/SymbolSelect'

import './TradeContainer.css'
import TradeOrders from './components/TradeOrders/TradeOrders'

const TradeContainer = () => {
  const { isTradePanelOpen } = useContext(TabContext)
  const { loadApiKeys } = useContext(UserContext)
  const history = useHistory()

  useEffect(() => {
    if (!loadApiKeys) {
      history.push('/settings')
    }
  }, [loadApiKeys, history])

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
