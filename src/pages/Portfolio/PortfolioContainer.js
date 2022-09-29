import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTimeout } from 'hooks'
import BalanceTable from './components/BalanceTable'
import EstimateValue from './components/EstimateValue'
import PortfolioDistribution from './components/PortfolioDistribution'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tooltip } from 'components'
import refreshPeriods from 'constants/refreshPeriods'
import './Portfolio.css'
import { useDispatch, useSelector } from 'react-redux'
import { useMediaQuery } from 'react-responsive'
import ExchangeSelector from './components/ExchangeSelector'
import { refreshPortfolioData, updateSelectedExchanges } from 'store/actions'
import { useLocation } from 'react-router-dom'

function PortfolioContainer() {
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [loadingLocked, setLoadingLocked] = useState(false)
  const { pathname } = useLocation()
  const isPortfolioPage = useMemo(() => pathname.includes('/portfolio'), [])
  const dispatch = useDispatch()
  const { balance, elapsed, portfolioLoading, selectedExchanges } = useSelector(
    (state) => state.portfolio
  )
  const { isOnboardingSkipped } = useSelector((state) => state.appFlow)
  const { activeExchange } = useSelector((state) => state.exchanges)
  const { userData } = useSelector((state) => state.users)
  const isMobile = useMediaQuery({ query: `(max-width: 400px)` })
  const lockText = useMemo(
    () =>
      `You can only use this button every ${
        refreshPeriods.portfolio / 1000
      } seconds`,
    []
  )
  const fetchData = useCallback(async () => {
    if (userData && activeExchange.exchange && selectedExchanges.length) {
      dispatch(refreshPortfolioData(selectedExchanges, isPortfolioPage))
    }
  }, [
    activeExchange.apiKeyName,
    activeExchange.exchange,
    isPortfolioPage,
    selectedExchanges,
  ])

  useEffect(() => {
    if (!isOnboardingSkipped) {
      if (!selectedExchanges.length && activeExchange?.label)
        dispatch(updateSelectedExchanges([activeExchange]))
      fetchData()
    }
  }, [
    userData,
    activeExchange,
    fetchData,
    isOnboardingSkipped,
    selectedExchanges,
  ])

  useEffect(() => {
    if (portfolioLoading) {
      setRefreshLoading(true)
    } else {
      setRefreshLoading(false)
    }
  }, [portfolioLoading])

  const onPortfolioRefresh = () => {
    dispatch(refreshPortfolioData(selectedExchanges, isPortfolioPage, true))
    setLoadingLocked(true)
  }

  useTimeout(
    () => setLoadingLocked(false),
    loadingLocked ? refreshPeriods.portfolio : null
  )

  return (
    <>
      <section
        className="py-5 slice bg-section-secondary portfolio-section"
        style={
          !balance || !balance.length ? { height: 'calc(100vh - 74px)' } : null
        }
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="row align-items-center">
                <div className="col">
                  <h1 className="mb-0 h4">Portfolio</h1>
                </div>{' '}
                <div className="col-auto">
                  {refreshLoading ? (
                    <button
                      className="btn btn-sm btn-neutral btn-icon"
                      type="button"
                      disabled
                    >
                      Refresh{'  '}
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    </button>
                  ) : (
                    <div>
                      {loadingLocked && <Tooltip id="portfolio" />}
                      <button
                        type="button"
                        data-for="portfolio"
                        data-tip={lockText}
                        className={`btn btn-sm btn-neutral btn-icon btn-neutral-disable ${
                          loadingLocked ? 'disabled' : ''
                        }`}
                        onClick={() =>
                          loadingLocked ? null : onPortfolioRefresh()
                        }
                      >
                        <span className="btn-inner--text">Refresh</span>
                        <span className="btn-inner--icon">
                          <FontAwesomeIcon icon={faSync} />
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="row align-items-center my-2 justify-content-between">
                <div className={`col-lg-5 ${!isMobile ? 'w-75' : ''}`}>
                  {activeExchange.label && (
                    <div className="">
                      <ExchangeSelector />
                    </div>
                  )}
                </div>
                {elapsed && !isMobile && (
                  <div className="col-auto">
                    <span className="float-right">{elapsed}</span>
                  </div>
                )}
              </div>
              {balance && balance.length ? (
                <>
                  <div className="row">
                    <div className="col-lg-12">
                      <EstimateValue />
                    </div>
                    <div className="col-lg-12">
                      <PortfolioDistribution />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12">
                      <BalanceTable />
                    </div>
                  </div>
                </>
              ) : (
                <div className="row">
                  <div className="col-lg-12">
                    <p className="text-center">No balances to display</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default PortfolioContainer
