import React, { useEffect, useState, useContext, useMemo } from 'react'
import MarketStatistics from '../Trade/components/MarketStatistics'
import TradeChart from '../Trade/TradeChart'
import WatchListPanel from './components/Watchlist/WatchListPanel'
import { useSymbolContext } from '../Trade/context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import { firebase } from '../firebase/firebase'
import { TEMPLATE_DRAWINGS_USERS } from '../constants/TemplateDrawingsList'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import TemplatesList from './components/Templates/TemplatesList'
import './MarketContainer.css'
import { TabNavigator } from '../components'

function MarketContainer() {
  const db = firebase.firestore()
  const [traders, setTraders] = useState([])
  const [activeValue, setActiveValue] = useState([])
  const [activeTab, setActiveTab] = useState(0)
  const {
    setIsTradersModalOpen,
    setActiveTrader,
    activeTrader,
    setTemplateDrawingsOpen,
    templateDrawingsOpen,
  } = useSymbolContext()
  const { userData } = useContext(UserContext)

  const tabElements = useMemo(() => {
    return userData.email === activeValue
      ? ['Watchlists', 'Templates ß']
      : ['Watchlists']
  }, [activeValue, userData])

  useEffect(() => {
    db.collection('template_drawings')
      .get()
      .then(
        (snapshot) => {
          const allTraders = snapshot.docs.map((tr) => {
            return { id: tr.id, ...tr.data() }
          })
          setTraders(allTraders)
        },
        (error) => {
          console.error(error)
        }
      )

    db.collection('chart_drawings')
      .doc(userData.email)
      .get(
        (snapshot) => {
          setActiveValue(snapshot.data().activeTrader)
        },
        (error) => {
          console.error(error)
        }
      )
  }, [db])

  useEffect(() => {
    if (!templateDrawingsOpen) {
      setActiveTab(0)
      setActiveValue(userData.email)
    } else {
      setActiveTab(0)
      setActiveValue(activeTrader.id)
    }
  }, [templateDrawingsOpen, userData, activeTrader])

  const timestampToDate = (time) => {
    dayjs.extend(relativeTime)
    return ` ${dayjs().to(time)}`
  }

  const setActiveTraderList = async (e) => {
    if (e.target.value === userData.email) {
      setTemplateDrawingsOpen((templateDrawingsOpen) => {
        localStorage.setItem('chartMirroring', false)
        return false
      })
      setActiveValue(e.target.value)
    } else {
      const trader = traders.find((el) => el.id === e.target.value)
      if (!trader) return
      await db.collection('chart_drawings').doc(userData.email).set(
        {
          activeTrader: trader.id,
        },
        { merge: true }
      )
      setActiveTrader(trader)

      setActiveValue(e.target.value)
      if (!templateDrawingsOpen) {
        setTemplateDrawingsOpen((templateDrawingsOpen) => {
          localStorage.setItem('chartMirroring', !templateDrawingsOpen)
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
                    disabled={TEMPLATE_DRAWINGS_USERS.includes(userData.email)}
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
