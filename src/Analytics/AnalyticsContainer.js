import React, { useState, useContext } from 'react'
import { UserContext } from '../contexts/UserContext'
import { AnalyticsContext } from './context/AnalyticsContext'
import { useSymbolContext } from '../Trade/context/SymbolContext'
import AnalyticsTable from './components/AnalyticsTable'
import AssetPerformance from './components/AssetPerformance'
import PairPerformance from './components/PairPerformance'
import AnalyticsFilter from './components/AnalyticsFilter'
import dayjs from 'dayjs'

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
                <div className="col-lg-6">
                  <AssetPerformance
                    search={search}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
                <div className="col-lg-6">
                  <PairPerformance
                    search={search}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </div>
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
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default AnalyticsContainer
