import React from 'react'
import DatePicker from 'react-datepicker'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Search from '../../components/Table/Search/Search'
import Tooltip from '../../components/Tooltip'

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
  return (
    <div className="card">
      <div className="row p-4">
        <div className="col-5-lg m-1 ml-2">
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
        <div className="col-auto ml-auto mt-4">
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
