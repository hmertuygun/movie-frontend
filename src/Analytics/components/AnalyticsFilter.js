import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Search from '../../components/Table/Search/Search'
import Tooltip from '../../components/Tooltip'
import { HelpCircle } from 'react-feather'
import './AnalyticsFilter.css'

const AnalyticsFilter = ({
  setSearch,
  setCurrentPage,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  loading,
  disablePortfolioRefreshBtn,
  portfolioTimeInterval,
  onPortfolioRefresh,
}) => {
  const [infoShow, setInfoShow] = useState(false)
  return (
    <div className="card">
      <div className="pb-0 card-header">
        <div className={`tab-info-wrapper ${infoShow ? 'show' : ''}`}>
          <span className="h6">Search</span>{' '}
          <HelpCircle
            size={18}
            onMouseEnter={() => setInfoShow(true)}
            onMouseLeave={() => setInfoShow(false)}
          />
          {infoShow && (
            <div className="tab-info">
              <p className="mb-2">
                This is where the trader should specify the exact period for
                which analytics should be calculated.
              </p>
              <a href="#" rel="noopener noreferrer">
                Symbol{' '}
              </a>
              a particular symbol that should be present in a trading pair,
              allows narrowing analytics
              <br />
              <a href="#" rel="noopener noreferrer">
                Start Date{' '}
              </a>
              the date when the trader entered the position
              <br />
              <a href="#" rel="noopener noreferrer">
                End Date{' '}
              </a>
              the date when the trader has closed the position (or current date
              if the position is still open)
              <br />
              <a href="#" rel="noopener noreferrer">
                Refresh button{' '}
              </a>
              this button refreshes all data that is used by analytics <br />
              <p className="my-2">
                The trader should clearly state the date when the position was
                entered and closed. If the position is still open, the trader
                may leave the End Date field empty or enter the current date.
              </p>
              <p className="my-2">
                New analytics shows long positions (assets bought to be sold at
                a higher price later) and short positions as well (assets sold
                to be bought back at a lower price later on).
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="row pl-5 p-4">
        <div className="col-5-lg m-1">
          <label className="form-control-label">Symbol</label>
          <Search
            onSearch={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
          />
        </div>
        <div className="col-4-lg m-1" style={{ width: '10rem' }}>
          <label className="form-control-label">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="form-control"
            placeholderText="MM-DD-YYYY"
            clearButtonTitle="Clear filter"
            isClearable={true}
          />
        </div>
        <div className="col-4-lg m-1" style={{ width: '10rem' }}>
          <label className="form-control-label">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="MM-DD-YYYY"
            className="form-control"
            clearButtonTitle="Clear filter"
            isClearable={true}
          />
        </div>
        <div className="col-auto ml-auto mt-4 refresh-button">
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
                  disablePortfolioRefreshBtn ? null : onPortfolioRefresh()
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
    </div>
  )
}

export default AnalyticsFilter
