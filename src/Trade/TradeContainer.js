import React, { useEffect, useContext, useState } from 'react'
import { Route } from 'react-router-dom'
import { useHistory } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import { firebase } from '../firebase/firebase'
import WatchListPanel from './WatchListPanel'
import TradePanel from './TradePanel'
import TradeChart from './TradeChart'
import { TabContext } from '../contexts/TabContext'
import { UserContext } from '../contexts/UserContext'
import SymbolSelect from './components/SymbolSelect/SymbolSelect'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import MarketStatistics from './components/MarketStatistics'
import { getNotices, dismissNotice } from '../api/api'
import {
  successNotification,
  errorNotification,
} from '../components/Notifications'
import TradeOrders from './components/TradeOrders/TradeOrders'
import './TradeContainer.css'
import { useSymbolContext } from './context/SymbolContext'

const db = firebase.firestore()

const registerResizeObserver = (cb, elem) => {
  const resizeObserver = new ResizeObserver(cb)
  resizeObserver.observe(elem)
}

const TradeContainer = () => {
  const { isTradePanelOpen } = useContext(TabContext)
  const { loadApiKeys, userData } = useContext(UserContext)
  const { watchListOpen } = useSymbolContext()
  const history = useHistory()
  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` })
  const totalHeight = window.innerHeight // - 40 - 75
  let chartHeight = watchListOpen
    ? window.innerHeight - 71 + 'px'
    : window.innerHeight * 0.6 + 'px'
  const [orderHeight, setOrderHeight] = useState(totalHeight * 0.4 + 'px')
  const [snapShotCount, setSnapShotCount] = useState(0)
  const [fbNotice, setFBNotice] = useState(null)
  const [notices, setNotices] = useState([])

  useEffect(() => {
    callObserver()
    getPendingNotices()
    const fBNotice = db
      .collection('platform_messages')
      .where('publishNow', '==', true)
      .onSnapshot((doc) => {
        doc.docChanges().forEach((item) => {
          // item.type = added , removed, modified
          // console.log(item.type, item.doc.id)
          if (item.type === 'removed') return
          const { sendToEveryone, emails } = item.doc.data()
          if (sendToEveryone) {
            setFBNotice({
              ...item.doc.data(),
              id: item.doc.id,
              action: item.type,
            })
          } else {
            const exists = emails.find((item) => item === userData.email)
            if (exists) {
              setFBNotice({
                ...item.doc.data(),
                action: item.type,
                id: item.doc.id,
              })
            }
          }
        })
        setSnapShotCount((prevValue) => prevValue + 1)
      })
    return () => {
      fBNotice()
    }
  }, [])

  useEffect(() => {
    if (snapShotCount > 1 && fbNotice && fbNotice.action === 'added') {
      setNotices((prevState) => [fbNotice, ...prevState])
    }
  }, [snapShotCount])

  useEffect(() => {
    if (!loadApiKeys) {
      history.push('/settings')
    }
  }, [loadApiKeys, history])

  const callObserver = () => {
    const elem = document.querySelector('.TradeView-Chart')
    if (!elem) return
    registerResizeObserver(resizeCallBack, elem)
  }

  const resizeCallBack = (entries, observer) => {
    const { contentRect } = entries[0]
    setOrderHeight(totalHeight - contentRect.height + 200 + 'px')
  }

  const getPendingNotices = async () => {
    try {
      let notices = await getNotices(5)
      notices = notices.map((item) => ({ id: item.id, ...item.data }))
      setNotices(notices)
    } catch (e) {
      console.log(e)
    }
  }

  const removeNotice = async (item, index) => {
    try {
      let temp = [...notices]
      temp.splice(index, 1)
      setNotices([...temp])
      await dismissNotice(item.id)
    } catch (e) {
      errorNotification.open({
        description: `Couldn't dismiss notice. Please try again later!`,
      })
      console.log(e)
    }
  }

  return (
    <>
      {!isMobile ? (
        <>
          {watchListOpen ? (
            <section className="WatchList-Panel">
              <WatchListPanel />
            </section>
          ) : (
            <section className="TradeView-Panel">
              <Route path="/trade/" component={TradePanel} />
            </section>
          )}
          <section
            className="TradeChart-Container"
            style={{ display: 'unset' }}
          >
            <div className={`${notices.length ? 'alert-messages mt-2' : ''}`}>
              {notices.map((item, index) => (
                <div
                  className={`text-center my-1 alert alert-${
                    item.noticeType || 'primary'
                  }`}
                  key={`notice-${index}`}
                >
                  <FontAwesomeIcon
                    color="white"
                    icon={`${
                      item.noticeType === 'danger'
                        ? 'times-circle'
                        : item.noticeType === 'warning'
                        ? 'exclamation-triangle'
                        : item.noticeType === 'info'
                        ? 'exclamation-circle'
                        : 'exclamation-circle'
                    }`}
                  />{' '}
                  {item.message}
                  <button
                    type="button"
                    className="close"
                    onClick={() => removeNotice(item, index)}
                  >
                    <span>&times;</span>
                  </button>
                </div>
              ))}
            </div>
            {!watchListOpen && (
              <section className="TradeView-Symbol">
                <SymbolSelect />
                <MarketStatistics />
              </section>
            )}
            <section
              className="TradeView-Chart"
              style={{
                resize: 'vertical',
                overflow: 'auto',
                height: chartHeight,
                paddingBottom: '10px',
              }}
            >
              <TradeChart />
            </section>
            {!watchListOpen && (
              <section className="TradeOrders" style={{ height: orderHeight }}>
                <TradeOrders />
              </section>
            )}
          </section>
        </>
      ) : isTradePanelOpen ? (
        <section className="TradeView-Panel TradeView-Panel-Mobile">
          <Route path="/trade/" component={TradePanel} />
        </section>
      ) : (
        <section className="TradeChart-Container TradeChart-Container-Mobile">
          <div className={`${notices.length ? 'alert-messages mt-2' : ''}`}>
            {notices.map((item, index) => (
              <div
                className={`text-center my-1 alert alert-${
                  item.noticeType || 'primary'
                }`}
                key={`notice-${index}`}
              >
                <FontAwesomeIcon
                  color="white"
                  icon={`${
                    item.noticeType === 'danger'
                      ? 'times-circle'
                      : item.noticeType === 'warning'
                      ? 'exclamation-triangle'
                      : item.noticeType === 'info'
                      ? 'exclamation-circle'
                      : 'exclamation-circle'
                  }`}
                />{' '}
                {item.message}
                <button
                  type="button"
                  className="close"
                  onClick={() => removeNotice(index)}
                >
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
    </>
  )
}

export default TradeContainer
