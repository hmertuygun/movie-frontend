import React, {
  useEffect,
  useContext,
  useCallback,
  useState,
  lazy,
  Suspense,
} from 'react'
import { Route } from 'react-router-dom'
import { useHistory } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import { firebase } from '../firebase/firebase'
import { TabContext } from '../contexts/TabContext'
import { UserContext } from '../contexts/UserContext'
import { useSymbolContext } from './context/SymbolContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getNotices, dismissNotice } from '../api/api'
import { errorNotification } from '../components/Notifications'
import './TradeContainer.css'
import Logo from '../components/Header/Logo/Logo'
import ErrorBoundary from '../components/ErrorBoundary'

const WatchListPanel = lazy(() => import('./WatchListPanel'))
const TradePanel = lazy(() => import('./TradePanel'))
const TradeChart = lazy(() => import('./TradeChart'))
const TradeOrders = lazy(() => import('./components/TradeOrders/TradeOrders'))
const MarketStatistics = lazy(() => import('./components/MarketStatistics'))
const SymbolSelect = lazy(() =>
  import('./components/SymbolSelect/SymbolSelect')
)
const TradersModal = lazy(() =>
  import('./components/TradersModal/TradersModal')
)

const db = firebase.firestore()
const registerResizeObserver = (cb, elem) => {
  const resizeObserver = new ResizeObserver(cb)
  resizeObserver.observe(elem)
}

const TradeContainer = () => {
  const { isTradePanelOpen } = useContext(TabContext)
  const { loadApiKeys, userData, isOnboardingSkipped } = useContext(UserContext)
  const { watchListOpen, isTradersModalOpen } = useSymbolContext()
  const history = useHistory()
  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` })
  const totalHeight = window.innerHeight // - 40 - 75
  let chartHeight = watchListOpen
    ? window.innerHeight + 'px'
    : isOnboardingSkipped
    ? 'calc(100vh - 134px)'
    : window.innerHeight * 0.6 + 'px'
  const [orderHeight, setOrderHeight] = useState(totalHeight * 0.4 + 'px')
  const [snapShotCount, setSnapShotCount] = useState(0)
  const [fbNotice, setFBNotice] = useState(null)
  const [notices, setNotices] = useState([])

  const resizeCallBack = useCallback(
    (entries, observer) => {
      const { contentRect } = entries[0]
      setOrderHeight(totalHeight - contentRect.height + 200 + 'px')
    },
    [totalHeight]
  )

  const callObserver = useCallback(() => {
    const elem = document.querySelector('.TradeView-Chart')
    if (!elem) return
    registerResizeObserver(resizeCallBack, elem)
  }, [resizeCallBack])

  useEffect(() => {
    if (!isOnboardingSkipped) {
      getPendingNotices()
    }
    const fBNotice = db
      .collection('platform_messages')
      .where('publishNow', '==', true)
      .onSnapshot((doc) => {
        let shouldReturn = false
        doc.docChanges().forEach((item) => {
          // item.type = added , removed, modified
          // console.log(item.type, item.doc.id)
          if (item.type === 'removed') {
            shouldReturn = true
            return
          }
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
        if (shouldReturn) return
        setSnapShotCount((prevValue) => prevValue + 1)
      })
    return () => {
      fBNotice()
    }
  }, [isOnboardingSkipped, userData.email])

  useEffect(() => {
    callObserver()
  }, [callObserver])

  useEffect(() => {
    if (snapShotCount > 1 && fbNotice && fbNotice.action === 'added') {
      setNotices((prevState) => [fbNotice, ...prevState])
    }
  }, [fbNotice, snapShotCount])

  useEffect(() => {
    if (!loadApiKeys && !isOnboardingSkipped) {
      history.push('/settings')
    }
  }, [loadApiKeys, history, isOnboardingSkipped])

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
        description: `Couldn't dismiss notice. Please try again later.`,
      })
      console.log(e)
    }
  }

  return (
    <>
      {isTradersModalOpen && (
        <section className="Traders-Modal">
          <ErrorBoundary componentName="TradersModal">
            <Suspense fallback={<div></div>}>
              <TradersModal />
            </Suspense>
          </ErrorBoundary>
        </section>
      )}
      {!isMobile ? (
        <>
          {watchListOpen ? (
            <div className="WatchListContainer">
              <div className="Logo-In-WatchList">
                <Logo />
              </div>
              <section className="WatchList-Panel">
                <ErrorBoundary componentName="WatchListPanel">
                  <Suspense fallback={<div></div>}>
                    <WatchListPanel />
                  </Suspense>
                </ErrorBoundary>
              </section>
            </div>
          ) : (
            <>
              {!isOnboardingSkipped && (
                <section className={`TradeView-Panel`}>
                  <div className={`${isOnboardingSkipped ? 'chart-view' : ''}`}>
                    <ErrorBoundary componentName="TradePanel">
                      <Suspense fallback={<div></div>}>
                        <Route path="/trade/" component={TradePanel} />
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                  {/* {isOnboardingSkipped && (
                <div className="chart-view-content">
                  <p>Add exchange to start trading</p>
                  <button
                    type="button"
                    className="btn btn-xs btn-primary btn-icon"
                    onClick={handleAddExchange}
                  >
                    <span className="btn-inner--text">Add Exchange</span>
                  </button>
                </div>
              )} */}
                </section>
              )}
            </>
          )}
          <section
            className="TradeChart-Container"
            style={{ display: 'unset' }}
          >
            <div
              className={`${notices.length ? 'alert-messages' : ''}`}
              style={{ margin: '0' }}
            >
              {notices.map((item, index) => (
                <div
                  style={{ padding: '10px' }}
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
              <section
                className={`TradeView-Symbol ${
                  isOnboardingSkipped ? 'skipped-trade-view' : ''
                }`}
              >
                <ErrorBoundary componentName="SymbolSelect">
                  <Suspense fallback={<div></div>}>
                    <SymbolSelect />
                  </Suspense>
                </ErrorBoundary>

                <ErrorBoundary componentName="MarketStatistics">
                  <Suspense fallback={<div></div>}>
                    <MarketStatistics />
                  </Suspense>
                </ErrorBoundary>
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
              <ErrorBoundary componentName="TradeChart">
                <Suspense fallback={<div></div>}>
                  <div
                    style={{
                      position: 'absolute',
                      marginLeft: '486px',
                      width: '170px',
                      height: '38px',
                      zIndex: -1,
                    }}
                    id="mirroring-tour1"
                  ></div>
                  <div
                    style={{
                      position: 'absolute',
                      marginLeft: '486px',
                      width: '170px',
                      height: '38px',
                      zIndex: -1,
                    }}
                    id="mirroring-tour2"
                  ></div>
                  <div
                    style={{
                      position: 'absolute',
                      marginLeft: '345px',
                      width: '135px',
                      height: '38px',
                      zIndex: -1,
                    }}
                    id="mirroring-tour3"
                  ></div>
                  <TradeChart />
                </Suspense>
              </ErrorBoundary>
            </section>
            {!isOnboardingSkipped && (
              <section
                className={`TradeOrders ${
                  isOnboardingSkipped ? 'chart-order-view-position' : ''
                }`}
                style={{
                  height: orderHeight,
                  display: watchListOpen ? 'none' : '',
                }}
              >
                <div
                  className={`${isOnboardingSkipped ? 'chart-order-view' : ''}`}
                >
                  <ErrorBoundary componentName="TradeOrders">
                    <Suspense fallback={<div></div>}>
                      <TradeOrders />
                    </Suspense>
                  </ErrorBoundary>
                </div>
                {/* {isOnboardingSkipped && (
                <div className="chart-view-order-content">
                  <p>Add exchange to start trading</p>
                </div>
              )} */}
              </section>
            )}
          </section>
        </>
      ) : isTradePanelOpen ? (
        <div className="TradeView-Panel TradeView-Panel-Mobile">
          <ErrorBoundary componentName="TradePanel">
            <Suspense fallback={<div></div>}>
              <Route path="/trade/" component={TradePanel} />
            </Suspense>
          </ErrorBoundary>
        </div>
      ) : (
        <div className="TradeChart-Container TradeChart-Container-Mobile">
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
          <section className="TradeView-Symbol">
            <ErrorBoundary componentName="SymbolSelect">
              <Suspense fallback={<div></div>}>
                <SymbolSelect />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary componentName="MarketStatistics">
              <Suspense fallback={<div></div>}>
                <MarketStatistics />
              </Suspense>
            </ErrorBoundary>
          </section>
          <section className="TradeView-Chart TradeView-Chart-Mobile">
            <ErrorBoundary componentName="TradeChart">
              <Suspense fallback={<div></div>}>
                <TradeChart />
              </Suspense>
            </ErrorBoundary>
          </section>
          {!isOnboardingSkipped && (
            <section
              className={`TradeOrders ${
                isOnboardingSkipped ? 'chart-order-view-position' : ''
              }`}
            >
              <div className={`${isOnboardingSkipped ? 'chart-view' : ''}`}>
                <ErrorBoundary componentName="TradeOrders">
                  <Suspense fallback={<div></div>}>
                    <TradeOrders />
                  </Suspense>
                </ErrorBoundary>
              </div>
              {/* {isOnboardingSkipped && (
              <div className="chart-view-content-mobile">
                <p>Add exchange to start trading</p>
                <button
                  type="button"
                  className="btn btn-xs btn-primary btn-icon"
                  onClick={handleAddExchange}
                >
                  <span className="btn-inner--text">Add Exchange</span>
                </button>
              </div>
            )} */}
            </section>
          )}
        </div>
      )}
    </>
  )
}

export default TradeContainer
