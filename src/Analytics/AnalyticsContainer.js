import React, { useState, useContext } from 'react'
import { UserContext } from '../contexts/UserContext'
import { AnalyticsContext } from './context/AnalyticsContext'
import { useSymbolContext } from '../Trade/context/SymbolContext'
import AnalyticsTable from './components/AnalyticsTable'
import AssetPerformance from './components/AssetPerformance'
import PairPerformance from './components/PairPerformance'
import AnalyticsFilter from './components/AnalyticsFilter'
import dayjs from 'dayjs'
import { exchangeCreationOptions } from '../constants/ExchangeOptions'

function AnalyticsContainer() {
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const { refreshData, loading } = useContext(AnalyticsContext)
  const { activeExchange } = useContext(UserContext)
  const {
    onRefreshBtnClicked,
    disablePortfolioRefreshBtn,
    portfolioTimeInterval,
  } = useSymbolContext()

  const onPortfolioRefresh = () => {
    let value = {
      startDate: startDate && dayjs(startDate).format('YYYY-MM-DD'),
      endDate: endDate && dayjs(endDate).format('YYYY-MM-DD'),
      skipCache: true,
    }
    refreshData(value)
    onRefreshBtnClicked('analytics')
  }

  const getLogo = (exchange) => {
    const obj = exchangeCreationOptions.find((sy) => sy.value === exchange)
    if (obj?.logo) return obj.logo
  }

  return (
    <>
      <section className="py-5 slice bg-section-secondary">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="row align-items-center">
                <div className="col">
                  <h1 className="mb-0 h4">Analytics</h1>
                </div>{' '}
              </div>
              <div className="row mt-1">
                <div className="col-auto">
                  <h4>
                    <span class="badge badge-secondary ">
                      <img
                        className="mb-1"
                        src={getLogo(activeExchange.exchange)}
                        style={{
                          width: '24px',
                          marginRight: '0.4rem',
                        }}
                      />
                      {activeExchange.apiKeyName}
                    </span>
                  </h4>
                </div>
              </div>
              <AnalyticsFilter
                setSearch={setSearch}
                setCurrentPage={setCurrentPage}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                loading={loading}
                disablePortfolioRefreshBtn={disablePortfolioRefreshBtn}
                portfolioTimeInterval={portfolioTimeInterval}
                onPortfolioRefresh={onPortfolioRefresh}
              />
              <div className="row">
                <div className="col-lg-12">
                  <AnalyticsTable
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    search={search}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-lg-5">
                  <AssetPerformance
                    search={search}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
                <div className="col-lg-7">
                  <PairPerformance
                    search={search}
                    startDate={startDate}
                    endDate={endDate}
                  />
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
