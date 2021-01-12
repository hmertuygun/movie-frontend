import React, { useState, useEffect, useContext } from 'react'
import BalanceTable from './components/BalanceTable'
import EstimateValue from './components/EstimateValue'
import PortfolioDistribution from './components/PortfolioDistribution'
import { PortfolioContext } from './context/PortfolioContext'

function PortfolioContainer() {
  const [refreshBtn, setRefreshBtne] = useState(false)
  const { loading, refreshData } = useContext(PortfolioContext)

  useEffect(() => {
    if (loading) {
      setRefreshBtne(true)
    } else {
      setRefreshBtne(false)
    }
  }, [loading])

  return (
    <>
      <section className="slice py-5 bg-section-secondary">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="row align-items-center mb-4">
                <div className="col">
                  <h1 className="h4 mb-0">Portfolio</h1>
                </div>{' '}
                <div className="col-auto">
                  {refreshBtn ? (
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
                    <button
                      type="button"
                      className="btn btn-sm btn-neutral btn-icon"
                      onClick={refreshData}
                    >
                      <span style={{ paddingRight: '6px' }}>Refresh</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="feather feather-refresh-ccw"
                      >
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <polyline points="23 20 23 14 17 14"></polyline>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6">
                  <EstimateValue />
                </div>
                <div className="col-lg-6">
                  <PortfolioDistribution />
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <BalanceTable />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default PortfolioContainer
