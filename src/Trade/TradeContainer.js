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

const db = firebase.firestore()
const registerResizeObserver = (cb, elem) => {
  const resizeObserver = new ResizeObserver(cb)
  resizeObserver.observe(elem)
}

const TradeContainer = () => {
  const { isTradePanelOpen } = useContext(TabContext)
  const {
    loadApiKeys,
    userData,
    isOnboardingSkipped,
    subscriptionData,
    cryptoBot,
    setCryptoBot,
  } = useContext(UserContext)
  const { watchListOpen } = useSymbolContext()
  const history = useHistory()
  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` })
  const totalHeight = window.innerHeight // - 40 - 75
  let chartHeight = watchListOpen
    ? window.innerHeight + 'px'
    : isOnboardingSkipped
    ? 'calc(100vh - 134px)'
    : window.innerHeight * 0.6 + 'px'
  const [orderHeight, setOrderHeight] = useState(totalHeight * 0.4 + 'px')
  const [fbNotice, setFBNotice] = useState(null)
  const [notices, setNotices] = useState([])
  const [finalNotices, setFinalNotices] = useState([])

  useEffect(() => {
    var Tawk_API = Tawk_API || {}
    ;(function () {
      var s1 = document.createElement('script'),
        s0 = document.getElementsByTagName('script')[0]
      s1.async = true
      s1.src = 'https://embed.tawk.to/61717bab86aee40a5737b7b1/1fiifct22'
      s1.charset = 'UTF-8'
      s1.setAttribute('crossorigin', '*')
      s0.parentNode.insertBefore(s1, s0)
      if (window.Tawk_API) {
        window.Tawk_API.hideWidget()
      }
    })()
    return () => {
      if (window.Tawk_API) {
        window.Tawk_API.hideWidget()
      }
    }
  }, [])

  useEffect(() => {
    if (cryptoBot && window.Tawk_API) {
      window.Tawk_API.showWidget()
      window.Tawk_API.maximize()
    } else if (window.Tawk_API && !cryptoBot) {
      window.Tawk_API.hideWidget()
    }
  }, [cryptoBot, history.location.search, window.Tawk_API])

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
    db.collection('platform_messages')
      .get()
      .then((snapshot) => {
        let obj = {}
        let allNotices = snapshot.docs.map((item) => {
          return { id: item.id, ...item.data() }
        })
        db.collection('user_notices')
          .doc(userData.email)
          .get()
          .then((userSnapShot) => {
            const date1 = new Date(
              subscriptionData?.subscription?.trial_end?.seconds * 1000
            )
            const isOver = new Date() > date1
            const diffTime = Math.abs(new Date() - date1)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            let payCrypto = !isOver && diffDays > 14
            if (userSnapShot.data()) {
              const dismissed = Object.keys(userSnapShot.data())
              allNotices = allNotices.filter(
                (item) => !dismissed.includes(item.id)
              )
            }
            allNotices.forEach((item) => {
              if (
                subscriptionData?.priceData?.interval ||
                subscriptionData?.subscription?.trial_end?.seconds
              )
                if (item.sendToEveryone) {
                  if (item.isPrivate) {
                    if (
                      !(
                        subscriptionData?.priceData?.interval === 'year' ||
                        payCrypto
                      )
                    ) {
                      obj[item.id] = item
                    }
                  }
                  if (item.exceptions?.length) {
                    const isInExceptions = item.exceptions.includes(
                      userData.email
                    )
                    if (isInExceptions && item.isPrivate) {
                      delete obj[item.id]
                    }
                  } else {
                    if (
                      typeof subscriptionData?.priceData?.interval ==
                        'string' &&
                      !item.isPrivate
                    )
                      obj[item.id] = item
                  }
                } else if (item.emails) {
                  const exists = item.emails.find(
                    (element) => element === userData.email
                  )
                  if (exists) {
                    obj[item.id] = item
                  }
                }
            })

            setNotices(obj)
          })
      })
  }, [
    userData.email,
    subscriptionData?.priceData?.interval,
    subscriptionData?.subscription?.trial_end?.seconds,
  ])

  useEffect(() => {
    let final = []
    for (const [key, value] of Object.entries(notices)) {
      final.push({ id: key, ...value })
    }
    setFinalNotices(final)
  }, [notices])

  useEffect(() => {
    callObserver()
  }, [callObserver])

  useEffect(() => {
    if (!loadApiKeys && !isOnboardingSkipped) {
      history.push('/settings')
    }
  }, [loadApiKeys, history, isOnboardingSkipped])

  const getAction = (param) => {
    if (param == 'crypto') {
      setCryptoBot(true)
    }
  }
  const removeNotice = async (item, index) => {
    try {
      let final = []
      setNotices((prev) => {
        let a = prev
        delete a[item]
        return a
      })
      for (const [key, value] of Object.entries(notices)) {
        if (key !== item) final.push({ id: key, ...value })
      }
      setFinalNotices(final)
      await dismissNotice(item)
    } catch (e) {
      errorNotification.open({
        description: `Couldn't dismiss notice. Please try again later.`,
      })
      console.log(e)
    }
  }

  return (
    <>
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
              className={`${finalNotices.length ? 'alert-messages' : ''}`}
              style={{ margin: '0' }}
            >
              {finalNotices.map((item, index) => (
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
                  {item.button?.text && (
                    <span
                      className="ml-2 badge badge-primary"
                      style={{ cursor: 'pointer' }}
                      onClick={() => getAction(item.button.type)}
                    >
                      {item.button.text}
                    </span>
                  )}
                  <button
                    type="button"
                    className="close"
                    onClick={() => removeNotice(item.id, index)}
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
                      width: '150px',
                      height: '38px',
                      zIndex: -1,
                    }}
                    id="mirroring-tour1"
                  ></div>
                  <div
                    style={{
                      position: 'absolute',
                      marginLeft: '345px',
                      width: '135px',
                      height: '38px',
                      zIndex: -1,
                    }}
                    id="mirroring-tour2"
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
          <div
            className={`${finalNotices.length ? 'alert-messages mt-2' : ''}`}
          >
            {finalNotices.map((item, index) => (
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
