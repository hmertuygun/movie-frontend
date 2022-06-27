import React, { useState, useEffect, useContext, useMemo } from 'react'
import useTimeout from 'hooks/useTimeout'
import BalanceTable from './components/BalanceTable'
import EstimateValue from './components/EstimateValue'
import PortfolioDistribution from './components/PortfolioDistribution'
import { PortfolioContext } from 'contexts/PortfolioContext'
import { UserContext } from 'contexts/UserContext'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tooltip } from 'components'
import getLogo from 'utils/getExchangeLogo'
import refreshPeriods from 'constants/refreshPeriods'
import './Portfolio.css'

function PortfolioContainer() {
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [loadingLocked, setLoadingLocked] = useState(false)
  const { loading, refreshData, balance, elapsed } =
    useContext(PortfolioContext)
  const { activeExchange } = useContext(UserContext)
  const lockText = useMemo(
    () =>
      `You can only use this button every ${
        refreshPeriods.portfolio / 1000
      } seconds`,
    []
  )

  useEffect(() => {
    if (loading) {
      setRefreshLoading(true)
    } else {
      setRefreshLoading(false)
    }
  }, [loading])

  const onPortfolioRefresh = () => {
    refreshData(true)
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
              <div className="row align-items-center">
                <div className="col">
                  <h4>
                    <span className="badge badge-secondary">
                      <img
                        className="mb-1"
                        src={getLogo(activeExchange.exchange)}
                        style={{
                          width: '24px',
                          marginRight: '0.4rem',
                        }}
                        alt={activeExchange.exchange}
                      />
                      {activeExchange.apiKeyName}
                    </span>
                  </h4>
                </div>
                <div className="col-auto">
                  {elapsed && <span className="float-right">{elapsed}</span>}
                </div>
              </div>
              {balance && balance.length ? (
                <>
                  <div className="row">
                    <div className="col-lg-4">
                      <EstimateValue />
                    </div>
                    <div className="col-lg-8">
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
