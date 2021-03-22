import React, { useEffect, useContext, useState } from 'react'
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
import MarketStatistics from './components/MarketStatistics'

import './TradeContainer.css'
import TradeOrders from './components/TradeOrders/TradeOrders'
const registerResizeObserver = (cb, elem) => {
  const resizeObserver = new ResizeObserver(cb)
  resizeObserver.observe(elem)
}
const TradeContainer = () => {
  const { isTradePanelOpen } = useContext(TabContext)
  const { loadApiKeys } = useContext(UserContext)
  const history = useHistory()
  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` });
  const totalHeight = window.innerHeight // - 40 - 75
  let chartHeight = window.innerHeight * .6 + "px"
  const [orderHeight, setOrderHeight] = useState(totalHeight * .4 + "px")

  useEffect(() => {
    const elem = document.querySelector(".TradeView-Chart")
    if (!elem) return
    registerResizeObserver(resizeCallBack, elem)
  }, [])

  const resizeCallBack = (entries, observer) => {
    const { contentRect } = entries[0]
    setOrderHeight((totalHeight - contentRect.height) + "px")
  }

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
              <MarketStatistics />
            </section>
            <section className="TradeView-Chart" style={{ resize: "vertical", overflow: "auto", height: chartHeight, paddingBottom: "10px" }}>
              <TradeChart />
            </section>
            <section className="TradeOrders" style={{ height: orderHeight }}>
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
            <MarketStatistics />
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
