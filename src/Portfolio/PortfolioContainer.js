import React, { useState, useEffect, useContext } from 'react'
import BalanceTable from './components/BalanceTable'
import EstimateValue from './components/EstimateValue'
import PortfolioDistribution from './components/PortfolioDistribution'
import { PortfolioContext } from './context/PortfolioContext'
import { UserContext } from '../contexts/UserContext'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSymbolContext } from '../Trade/context/SymbolContext'
import Tooltip from '../components/Tooltip'

function PortfolioContainer() {
  const [refreshBtn, setRefreshBtne] = useState(false)
  const { loading, refreshData } = useContext(PortfolioContext)
  const { activeExchange } = useContext(UserContext)
  const {
    onRefreshBtnClicked,
    disablePortfolioRefreshBtn,
    portfolioTimeInterval,
  } = useSymbolContext()

  const onUnload = () => {
    localStorage.removeItem(
      `portfolio_${activeExchange.apiKeyName}_${activeExchange.exchange}`
    )
  }

  useEffect(() => {
    window.addEventListener('beforeunload', onUnload)
    return () => {
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [])

  useEffect(() => {
    if (loading) {
      setRefreshBtne(true)
    } else {
      setRefreshBtne(false)
    }
  }, [loading])

  const onPortfolioRefresh = () => {
    refreshData()
    onRefreshBtnClicked('portfolio')
  }

  return (
    <>
      <section className="py-5 slice bg-section-secondary">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              {/* <div class="text-center">
                We are aware that for some users, some coins are missing in the
                portfolio, please use the Report a Problem button and attach a
                screenshot of the coin that is missing from your portfolio. We
                apologize for the inconvenience.
              </div> */}
              <div className="mb-4 row align-items-center">
                <div className="col">
                  <h1 className="mb-0 h4">Portfolio</h1>
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
