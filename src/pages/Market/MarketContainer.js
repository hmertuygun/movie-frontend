/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useMemo } from 'react'
import MarketStatistics from '../Trade/components/MarketStatistics'
import TradeChart from '../Trade/TradeChart'
import WatchListPanel from './Watchlist/WatchListPanel'
import { TabNavigator } from 'components'
import TemplatesList from './Templates/TemplatesList'
import './MarketContainer.css'
import { useDispatch, useSelector } from 'react-redux'
import {
  setActiveAnalysts,
  saveChartDrawings,
  updateChartMirroring,
  updateTemplateDrawingsOpen,
  getChartMetaData,
  updateAddTemplateModalOpen,
} from 'store/actions'
import AnalystSelector from './components/AnalystSelector'
import { trackEvent } from 'services/tracking'
import { analytics } from 'services/firebase'
import { allowedFeatures } from 'utils/feature'

const MarketContainer = () => {
  const { userData } = useSelector((state) => state.users)
  const { templateDrawingsOpen } = useSelector((state) => state.templates)
  const { activeTrader } = useSelector((state) => state.trades)
  const { chartMetaData } = useSelector((state) => state.charts)
  const { allAnalysts } = useSelector((state) => state.analysts)

  const dispatch = useDispatch()
  const [activeValue, setActiveValue] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const tabElements = useMemo(() => {
    return allowedFeatures(
      templateDrawingsOpen ? ['Watchlists'] : ['Watchlists', 'Templates ß']
    )
  }, [templateDrawingsOpen])

  useEffect(() => {
    dispatch(updateAddTemplateModalOpen(false))
    dispatch(getChartMetaData())
  }, [userData.email])

  useEffect(() => {
    setActiveValue(chartMetaData?.activeTrader)
  }, [chartMetaData])

  useEffect(() => {
    setActiveTab(0)
    setActiveValue(templateDrawingsOpen ? activeTrader.id : userData.email)
  }, [templateDrawingsOpen, userData, activeTrader, chartMetaData])

  const setActiveTraderList = async (id) => {
    if (id === userData.email) {
      dispatch(updateChartMirroring(false))
      dispatch(updateTemplateDrawingsOpen(false))
      setActiveValue(id)
    } else {
      const trader = allAnalysts.find((el) => el.id === id)
      if (!trader) return

      trackEvent('user', `${id}_cm`, `${id}_cm`)
      analytics.logEvent(`${id}_cm`)
      await dispatch(setActiveAnalysts(chartMetaData, allAnalysts, trader.id))
      await dispatch(
        saveChartDrawings({
          activeTrader: trader.id,
        })
      )

      setActiveValue(trader.id)
      if (!templateDrawingsOpen) {
        dispatch(updateChartMirroring(!templateDrawingsOpen))
        dispatch(updateTemplateDrawingsOpen(!templateDrawingsOpen))
      }
    }
  }

  const handleShowInfo = () => {
    setShowInfo(!showInfo)
    localStorage.setItem('showAnalystInfo', !showInfo)
  }

  useEffect(() => {
    let show = localStorage.getItem('showAnalystInfo')
    if (show) {
      setShowInfo(show)
    }
  }, [])

  const currentAnalyst = allAnalysts.find(
    (trader) => trader?.id === activeValue
  )

  return (
    <>
      <section className="m-1">
        <div className="row">
          <div className="col-lg-3 pr-lg-1">
            <div className="card p-3 mb-1 pb-2">
              <div>
                <div className="d-flex align-items-center justify-content-between">
                  <label className="form-control-label">
                    Chart Mirroring - Select Analyst
                  </label>
                  {currentAnalyst && (
                    <p className="show-analyst-info" onClick={handleShowInfo}>
                      {showInfo ? 'Hide' : 'Show'} Analyst Info
                    </p>
                  )}
                </div>
                <div>
                  <AnalystSelector
                    traders={allAnalysts}
                    handleChange={setActiveTraderList}
                    activeValue={activeValue}
                    userData={userData}
                    showInfo={showInfo}
                  />
                </div>
              </div>
            </div>
            <div
              className={`card mb-2 tool-sidebar ${
                !showInfo ? 'enlarge-list' : ''
              }`}
            >
              <TabNavigator
                index={activeTab}
                labelArray={tabElements}
                hadDropDown={false}
                hasMargin={true}
                changeTab={(index) => setActiveTab(index)}
              >
                <WatchListPanel />
                {!templateDrawingsOpen && <TemplatesList />}
              </TabNavigator>
            </div>
          </div>
          <div className="col-lg-9 col-md-12 market-stat-chart">
            <div className="row">
              <div className="col-lg-12 pl-lg-1">
                <div className="card mb-1">
                  <MarketStatistics market={true} />
                </div>
              </div>
            </div>
            <div
              style={{ height: 'calc(100vh - 150px)' }}
              className="row market-chart-mobile"
              id="market-chart-container"
            >
              <div className="col-lg-12 pl-lg-1 market-chart-mobile-container">
                <div
                  className="card mb-0 p-1"
                  style={{ width: '100%', height: '100%' }}
                >
                  <TradeChart />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default MarketContainer
