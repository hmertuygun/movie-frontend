import React, { useEffect, useContext, useState } from 'react'
import { Route } from 'react-router-dom'
import { useHistory } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import { firebase } from '../firebase/firebase'
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

const db = firebase.firestore()

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
  const [snapShotCount, setSnapShotCount] = useState(0)
  const [fbNotice, setFBNotice] = useState(null)
  const [notices, setNotices] = useState([])

  useEffect(() => {
    callObserver()
    const fBNotice = db.collection("platform_messages")
      .where("type", "in", ['warning', 'danger', 'info'])
      .onSnapshot((doc) => {
        doc.docChanges().forEach(item => {
          setFBNotice({ ...item.doc.data(), action: item.type }) // action = added , removed, modified
        })
        setSnapShotCount(prevValue => prevValue + 1)
      })
    return () => {
      fBNotice()
    }
  }, [])

  useEffect(() => {
    if (snapShotCount > 1 && fbNotice && fbNotice.action === "added") {
      setNotices(prevState => [...prevState, fbNotice])
    }
  }, [snapShotCount])

  useEffect(() => {
    if (!loadApiKeys) {
      history.push('/settings')
    }
  }, [loadApiKeys, history])

  const callObserver = () => {
    const elem = document.querySelector(".TradeView-Chart")
    if (!elem) return
    registerResizeObserver(resizeCallBack, elem)
  }

  const resizeCallBack = (entries, observer) => {
    const { contentRect } = entries[0]
    setOrderHeight((totalHeight - contentRect.height) + "px")
  }

  const removeNotice = (index) => {
    let temp = [...notices]
    temp.splice(index, 1)
    setNotices([...temp])
  }

  return (
    <SymbolContextProvider>
      {!isMobile ? (
        <>
          <section className="TradeView-Panel">
            <Route path="/trade/" component={TradePanel} />
          </section>

          <section className="TradeChart-Container" style={{ display: "unset" }}>
            <div className={`mx-5 ${notices.length ? 'alert-messages mt-2' : ''}`}>
              {notices.map((item, index) => (
                <div className={`text-center my-1 alert alert-${item.type}`} key={`notice-${index}`}>
                  <FontAwesomeIcon color="white" icon={`${item.type === 'danger' ? 'times-circle' : item.type === 'warning' ? 'exclamation-triangle' : item.type === 'info' ? 'exclamation-circle' : ''}`} /> {item.message}
                  <button type="button" className="close" onClick={() => removeNotice(index)}>
                    <span>&times;</span>
                  </button>
                </div>
              ))}
            </div>
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
          <div className={`mx-5 ${notices.length ? 'alert-messages mt-2' : ''}`}>
            {notices.map((item, index) => (
              <div className={`text-center my-1 alert alert-${item.type}`} key={`notice-${index}`}>
                <FontAwesomeIcon color="white" icon={`${item.type === 'danger' ? 'times-circle' : item.type === 'warning' ? 'exclamation-triangle' : item.type === 'info' ? 'exclamation-circle' : ''}`} /> {item.message}
                <button type="button" className="close" onClick={() => removeNotice(index)}>
                  <span>&times;</span>
                </button>
              </div>
            ))}
          </div>
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
