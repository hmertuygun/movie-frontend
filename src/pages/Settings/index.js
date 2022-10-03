import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, Moon } from 'react-feather'

import { Permitted, TabNavigator } from 'components'
import Exchanges from '../Settings/Exchanges/Exchanges'
import Security from '../Settings/Security/Security'
import Notifications from '../Settings/Notifications'
import Subscriptions from '../Settings/Subscription'
import { ThemeContext } from 'contexts/ThemeContext'
import { storage } from 'services/storages'
import './Settings.css'
import { useDispatch } from 'react-redux'
import { updateSetShowThemeWarning } from 'store/actions'

const SETTINGS_TAB = {
  '#exchanges': 0,
  '#security': 1,
  '#notifications': 2,
  '#subscription': 3,
}

const Settings = () => {
  const { hash } = useLocation()
  const dispatch = useDispatch()
  const [tabIndex, setTabIndex] = useState(0)
  const { theme, setTheme } = useContext(ThemeContext)

  const askThemeForChart = useCallback(() => {
    dispatch(updateSetShowThemeWarning(true))
  }, [dispatch])

  useEffect(() => {
    setTabIndex(SETTINGS_TAB[hash])
  }, [hash])

  return (
    <Fragment>
      <section
        className="pt-5 bg-section-secondary settings-section"
        style={{ minHeight: 'calc(100vh - 72px)' }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="row align-items-center">
                <div className="col">
                  <span className="surtitle">Your account</span>

                  <div className="d-flex justify-content-between align-items-center">
                    <h1 className="mb-0 h2">Settings</h1>
                    <div className="d-flex justify-content-between align-items-center">
                      <span
                        type="button"
                        id="btnSwitchMode"
                        className={`ml-lg-auto d-flex d-lg-none mr-5 ${
                          theme === 'DARK' ? 'text-warning' : ''
                        }`}
                        onClick={askThemeForChart}
                      >
                        <Moon className="chevron-down" strokeWidth="2" />
                      </span>
                      <Link
                        to="/logout"
                        className="ml-lg-auto d-flex d-lg-none mb-1"
                      >
                        <LogOut strokeWidth="2" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 row align-items-center">
                <div className="col-12">
                  <TabNavigator
                    labelArray={[
                      'Exchanges',
                      'Security',
                      'Notifications',
                      'Subscription',
                    ]}
                    index={tabIndex}
                    hadDropDown={false}
                  >
                    <Exchanges />
                    <Security />
                    <Notifications />
                    <Subscriptions />
                  </TabNavigator>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  )
}

export default Settings
