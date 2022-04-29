import React, { useEffect, useState, useContext, useMemo } from 'react'
import MarketStatistics from '../Trade/components/MarketStatistics'
import TradeChart from '../Trade/TradeChart'
import WatchListPanel from './Watchlist/WatchListPanel'
import { TabNavigator } from 'components'
import TemplatesList from './Templates/TemplatesList'
import { useSymbolContext } from 'contexts/SymbolContext'
import { UserContext } from 'contexts/UserContext'
import { storage } from 'services/storages'
import {
  getFirestoreDocumentData,
  setChartDrawings,
  updateSingleValue,
} from 'services/api'
import './MarketContainer.css'

const MarketContainer = () => {
  const {
    activeTrader,
    setTemplateDrawingsOpen,
    templateDrawingsOpen,
    setActiveAnalysts,
  } = useSymbolContext()
  const { userData, allAnalysts, isAnalyst } = useContext(UserContext)
  const [traders] = useState(allAnalysts)
  const [activeValue, setActiveValue] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const tabElements = useMemo(() => {
    return userData.email === activeValue
      ? ['Watchlists', 'Templates ß']
      : ['Watchlists']
  }, [activeValue, userData])

  useEffect(() => {
    getFirestoreDocumentData('chart_drawings', userData.email).then(
      (snapshot) => {
        setActiveValue(snapshot.data().activeTrader)
      }
    )
  }, [userData.email])

  useEffect(() => {
    setActiveTab(0)
    setActiveValue(templateDrawingsOpen ? activeTrader.id : userData.email)
  }, [templateDrawingsOpen, userData, activeTrader])

  const setActiveTraderList = async (e) => {
    if (e.target.value === userData.email) {
      setTemplateDrawingsOpen(() => {
        storage.set('chartMirroring', false)
        return false
      })
      setActiveValue(e.target.value)
    } else {
      const trader = traders.find((el) => el.id === e.target.value)
      if (!trader) return
      await setActiveAnalysts(trader.id)
      await updateSingleValue(userData.email, 'chart_drawings', {
        activeTrader: trader.id,
      })

      setActiveValue(e.target.value)
      if (!templateDrawingsOpen) {
        setTemplateDrawingsOpen((templateDrawingsOpen) => {
          storage.set('chartMirroring', !templateDrawingsOpen)
          return !templateDrawingsOpen
        })
      }
    }
  }

  return (
    <>
      <section className="m-1">
        <div className="row">
          <div className="col-lg-3">
            <div className="card p-3 mb-1 pb-2">
              <div className="form-group">
                <label className="form-control-label">
                  Chart Mirroring - Select Analyst
                </label>
                <div>
                  <select
                    disabled={isAnalyst}
                    value={activeValue}
                    onChange={(e) => setActiveTraderList(e)}
                    className="custom-select custom-select-sm"
                  >
                    <option value={userData.email}>Me</option>
                    {traders.map((element) => {
                      return (
                        <option key={element.id} value={element.id}>
                          {element.name}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>
            </div>
            <div className="card mb-2 mx-1">
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
          <div className="col-lg-9 col-md-12 pl-0 market-stat-chart">
            <div className="row">
              <div className="col-lg-12">
                <div className="card m-1">
                  <MarketStatistics market={true} />
                </div>
              </div>
            </div>
            <div
              style={{ height: 'calc(100vh - 146px)', marginRight: -7 }}
              className="row market-chart-mobile"
              id="market-chart-container"
            >
              <div className="col-lg-12 m-1 market-chart-mobile-container">
                <div
                  className="card mb-0 p-2"
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
