import React, { useCallback, useEffect, useState } from 'react'
import AnalyticsTable from './components/AnalyticsTable'
import AssetPerformance from './components/AssetPerformance'
import PairPerformance from './components/PairPerformance'
import AnalyticsFilter from './components/AnalyticsFilter'
import dayjs from 'dayjs'
import './Analytics.css'
import { portfolioTimeInterval } from 'constants/TimeIntervals'
import { useDispatch, useSelector } from 'react-redux'
import { refreshAnalyticsData, updateRefreshButton } from 'store/actions'
import { EXCHANGES } from 'constants/Exchanges'

function AnalyticsContainer() {
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const dispatch = useDispatch()
  const { activeExchange } = useSelector((state) => state.exchanges)
  const { analyticsLoading } = useSelector((state) => state.analytics)
  const { isOnboardingSkipped } = useSelector((state) => state.appFlow)
  const { disablePortfolioRefreshBtn } = useSelector((state) => state.refresh)
  const { userData } = useSelector((state) => state.users)

  const onPortfolioRefresh = () => {
    let value = {
      startDate: startDate && dayjs(startDate).format('YYYY-MM-DD'),
      endDate: endDate && dayjs(endDate).format('YYYY-MM-DD'),
      skipCache: true,
    }
    dispatch(refreshAnalyticsData(activeExchange, value))
    dispatch(updateRefreshButton('analytics'))
  }

  const getLogo = (exchange) => {
    const obj = EXCHANGES[exchange]
    if (obj?.logo) return obj.logo
  }

  const fetchData = useCallback(async () => {
    if (userData && activeExchange.exchange) {
      dispatch(refreshAnalyticsData(activeExchange, {}))
    }
  }, [userData, activeExchange?.exchange])

  useEffect(() => {
    if (!isOnboardingSkipped) {
      fetchData()
    }
  }, [userData, activeExchange, isOnboardingSkipped])

  return (
    <>
      <section className="py-5 slice bg-section-secondary analytics-section">
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
                    <span className="badge badge-secondary ">
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
              </div>
              <AnalyticsFilter
                setSearch={setSearch}
                setCurrentPage={setCurrentPage}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                loading={analyticsLoading}
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
