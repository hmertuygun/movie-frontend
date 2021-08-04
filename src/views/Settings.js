import React, { Fragment, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, Moon } from 'react-feather'

import { TabNavigator } from '../components'
import Exchanges from '../Settings/Exchanges/Exchanges'
import Security from '../Settings/Security/Security'
import Notifications from '../Settings/Notifications'
import Subscriptions from '../Settings/Subscription'
import { ThemeContext } from '../contexts/ThemeContext'

const Settings = () => {
  const { hash } = useLocation()
  const tabIndex = hash === '#subscription' ? 3 : 0
  const { theme, setTheme } = useContext(ThemeContext)

  const toggleTheme = () => {
    setTheme((theme) => {
      let newTheme = ''
      switch (theme) {
        case 'LIGHT':
          newTheme = 'DARK'
          break
        case 'DARK':
          newTheme = 'LIGHT'
          break
        default:
          newTheme = 'LIGHT'
          break
      }
      localStorage.setItem('theme', newTheme)

      return newTheme
    })
  }

  return (
    <Fragment>
      <section
        className="pt-5 bg-section-secondary"
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
                        className={`nav-link nav-link-icon px-4 ml-lg-auto d-flex d-lg-none ${
                          theme === 'DARK' ? 'text-warning' : ''
                        }`}
                        onClick={toggleTheme}
                      >
                        <Moon className="chevron-down" strokeWidth="3" />
                      </span>
                      <Link
                        to="/logout"
                        className="ml-lg-auto d-flex d-lg-none"
                      >
                        <LogOut strokeWidth="3" />
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
                      'Subscriptions & Billing',
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
