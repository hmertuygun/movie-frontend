import React, { useEffect, useContext } from 'react'
import { Route } from 'react-router-dom'
import { useHistory } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive';

import TradePanel from './TradePanel'
import TradeChart from './TradeChart'
import { SymbolContextProvider } from './context/SymbolContext'
import { TabContext } from '../contexts/TabContext'
import { UserContext } from '../contexts/UserContext'
import SymbolSelect from './components/SymbolSelect/SymbolSelect'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './TradeContainer.css'
import TradeOrders from './components/TradeOrders/TradeOrders'

const TradeContainer = () => {
  const { isTradePanelOpen } = useContext(TabContext)
  const { loadApiKeys } = useContext(UserContext)
  const history = useHistory()
  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` });

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

          <section className="TradeChart-Container" style={{ display: "unset" }}>
            <section className="TradeView-Symbol">
              <SymbolSelect />
            </section>
            <section className="TradeView-Chart" style={{ resize: "vertical", overflow: "auto", height: "60vh", paddingBottom: "10px" }}>
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
