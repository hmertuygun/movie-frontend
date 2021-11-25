import React, { useState, useEffect, useCallback, useContext } from 'react'
import { UserContext } from '../contexts/UserContext'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AnalyticsContext } from './context/AnalyticsContext'
import Tooltip from '../components/Tooltip'
import { useSymbolContext } from '../Trade/context/SymbolContext'
import AnalyticsTable from './components/AnalyticsTable'

function AnalyticsContainer() {
  const { refreshData, loading } = useContext(AnalyticsContext)
  const { activeExchange } = useContext(UserContext)
  const {
    onRefreshBtnClicked,
    disablePortfolioRefreshBtn,
    portfolioTimeInterval,
  } = useSymbolContext()

  const onPortfolioRefresh = () => {
    refreshData({ skipCache: true })
    onRefreshBtnClicked('analytics')
  }

  return (
    <>
      <section className="py-5 slice bg-section-secondary">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="mb-4 row align-items-center">
                <div className="col">
                  <h1 className="mb-0 h4">Analytics</h1>
                </div>{' '}
                <div className="col-auto">
                  {loading ? (
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
                      {disablePortfolioRefreshBtn && <Tooltip id="portfolio" />}
                      <button
                        type="button"
                        data-for="portfolio"
                        data-tip={`You can only use this button every ${
                          portfolioTimeInterval / 1000
                        } seconds`}
                        className={`btn btn-sm btn-neutral btn-icon btn-neutral-disable ${
                          disablePortfolioRefreshBtn ? 'disabled' : ''
                        }`}
                        onClick={() =>
                          disablePortfolioRefreshBtn
                            ? null
                            : onPortfolioRefresh()
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
              <div className="row">
                <div className="col-lg-12">
                  <AnalyticsTable />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default AnalyticsContainer
