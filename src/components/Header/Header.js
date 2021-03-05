import React, { useState, useContext } from 'react'

import Menu from './Menu/Menu'
import Logo from './Logo/Logo'
import MenuItems from './Navigation/NavBar/MenuItems'
import MobileTab from './MobileTab/MobileTab'

import { UserContext } from '../../contexts/UserContext'

const Header = () => {
  const [settingToggle, setSettingToggle] = useState(false)
  const { isLoggedIn } = useContext(UserContext)

  const toggleSetting = () => {
    setSettingToggle(!settingToggle)
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <header className="" id="header-main">
      <nav
        className="navbar navbar-main navbar-expand-lg shadow navbar-light"
        id="navbar-main"
      >
        <div className="container">
          <Logo />
          <div
            className="collapse navbar-collapse navbar-collapse-overlay order-lg-3"
            id="navbar-main-collapse"
          >
            <div className="position-relative">
              <button
                className="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navbar-main-collapse"
                aria-controls="navbar-main-collapse"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <i data-feather="align-justify"></i>
              </button>
            </div>
            <MenuItems />
            {/* setting dropdown Menu */}
            <ul className="navbar-nav align-items-lg-center d-none d-lg-flex ml-lg-auto">
              {/* menu report a problem button */}
              <li className="nav-item">
                <a
                  href="https://support.coinpanel.com/hc/en-us/requests/new"
                  className="btn btn-xs btn-primary btn-icon mr-3"
                  target="_blank"
                  rel="noreferrer"
                >
                  {' '}
                  <span className="btn-inner--text">Report a problem</span>
                </a>
              </li>
              <Menu
                settingToggle={settingToggle}
                toggleSetting={() => toggleSetting()}
                setSettingToggle={(toggle) => setSettingToggle(toggle)}
              />
            </ul>
            {/* <Notifications /> */}
          </div>
        </div>
      </nav>
      <MobileTab />
    </header>
  )
}

export default Header
