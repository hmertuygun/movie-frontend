import React, { useEffect, useContext, lazy, Suspense } from 'react'
import { Route } from 'react-router-dom'
import { useHistory } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import { TabContext } from '../contexts/TabContext'
import { UserContext } from '../contexts/UserContext'
import { useSymbolContext } from './context/SymbolContext'
import './TradeContainer.css'
import ErrorBoundary from '../components/ErrorBoundary'
const TradePanel = lazy(() => import('./TradePanel'))
const TradeChart = lazy(() => import('./TradeChart'))
const TradeOrders = lazy(() => import('./components/TradeOrders/TradeOrders'))
const MarketStatistics = lazy(() => import('./components/MarketStatistics'))
const SymbolSelect = lazy(() =>
  import('./components/SymbolSelect/SymbolSelect')
)

const TradeContainer = () => {
  const { isTradePanelOpen } = useContext(TabContext)
  const { watchListOpen } = useSymbolContext()
  const { loadApiKeys, isOnboardingSkipped } = useContext(UserContext)
  const history = useHistory()
  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` })

  const totalHeight = window.innerHeight // - 40 - 75
  let chartHeight = window.innerHeight * 0.6 + 'px'
  const orderHeight = (totalHeight * 0.4).toFixed(0) + 'px'

  useEffect(() => {
    if (!loadApiKeys && !isOnboardingSkipped) {
      history.push('/settings')
    }
  }, [loadApiKeys, history, isOnboardingSkipped])

  return (
    <>
      {!isMobile ? (
        <>
          <section className={`TradeView-Panel`}>
            <div className={`${isOnboardingSkipped ? 'chart-view' : ''}`}>
              <ErrorBoundary componentName="TradePanel">
                <Suspense fallback={<div></div>}>
                  <Route path="/trade/" component={TradePanel} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </section>

          <section
            className="TradeChart-Container"
            style={{ display: 'unset' }}
          >
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
            <section
              className={`TradeOrders ${
                isOnboardingSkipped ? 'chart-order-view-position' : ''
              }`}
              style={{
                minHeight: orderHeight,
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
          </section>
        </div>
      )}
    </>
  )
}

export default TradeContainer
