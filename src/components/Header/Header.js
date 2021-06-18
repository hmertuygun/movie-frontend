import React, { useState, useContext, useEffect } from 'react'
import {
  faTwitter,
  faTelegram,
  faMediumM,
} from '@fortawesome/free-brands-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Menu from './Menu/Menu'
import Logo from './Logo/Logo'
import MenuItems from './Navigation/NavBar/MenuItems'
import MobileTab from './MobileTab/MobileTab'

import { UserContext } from '../../contexts/UserContext'
import { ThemeContext } from '../../contexts/ThemeContext'
import { useSymbolContext } from '../../Trade/context/SymbolContext'
import { useHistory } from 'react-router-dom'
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride'
import { secondTourSteps } from '../../helpers/tourSteps'
import { Moon } from 'react-feather'

const Header = () => {
  const {
    isLoggedIn,
    onSecondTour,
    tour2CurrentStep,
    setTour2CurrentStep,
  } = useContext(UserContext)
  const { theme, setTheme } = useContext(ThemeContext)
  const { watchListOpen } = useSymbolContext()

  const [settingToggle, setSettingToggle] = useState(false)
  const [stepIndex2, setStepIndex2] = useState(0)
  const [run2, setRun2] = useState(true)
  const [stepsSecondTour] = useState(secondTourSteps)
  const history = useHistory()

  const styles = {
    options: {
      overlayColor: 'rgba(0, 0, 0, 0.6)',
      spotlightShadow: '#b8b8b885',
      primaryColor: '#1976D2',
      textColor: '#333',
      zIndex: 999999,
    },
  }

  const toggleSetting = () => {
    setSettingToggle(!settingToggle)
  }

  const handleJoyrideCallback2 = (data) => {
    const { action, index, status, type } = data

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      // Update state to advance the tour
      setTour2CurrentStep(index + (action === ACTIONS.PREV ? -1 : 1))
      setStepIndex2(index + (action === ACTIONS.PREV ? -1 : 1))
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      setRun2(false)
    }
  }

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

  const addDarkClassToBody = () => {
    const element = document.body
    switch (theme) {
      case 'LIGHT':
        element.classList.remove('dark')
        break
      case 'DARK':
        element.classList.add('dark')
        break
      default:
        break
    }
  }

  useEffect(() => {
    addDarkClassToBody()
  }, [theme])

  useEffect(() => {
    if (stepIndex2 === 2) {
      history.push('/settings')
    }
    if (tour2CurrentStep === 5) {
      setRun2(false)
      setTimeout(() => {
        setRun2(true)
      }, 1000)
    }
  }, [stepIndex2])

  if (!isLoggedIn || watchListOpen) {
    return null
  }

  return (
    <header className="" id="header-main">
      <nav
        className={`shadow navbar navbar-main navbar-expand-lg ${
          theme === 'LIGHT'
            ? 'navbar-light bg-whtie'
            : 'navbar-dark bg-dark'
        }`}
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
                  className="mr-3 btn btn-xs btn-primary btn-icon"
                  target="_blank"
                  rel="noreferrer"
                >
                  {' '}
                  <span className="btn-inner--text">Report a problem</span>
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="https://coin-panel.medium.com/"
                  type="button"
                  className="px-2 nav-link nav-link-icon"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FontAwesomeIcon icon={faMediumM} className="mt-2" />
                </a>
              </li>{' '}
              <li className="nav-item">
                <a
                  href="https://twitter.com/coin_panel"
                  type="button"
                  className="px-2 nav-link nav-link-icon"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FontAwesomeIcon icon={faTwitter} className="mt-2" />
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="https://t.me/coinpanelsupport"
                  type="button"
                  className="px-2 nav-link nav-link-icon"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FontAwesomeIcon icon={faTelegram} className="mt-2" />
                </a>
              </li>
              <li className="nav-item">
                <span
                  type="button"
                  id="btnSwitchMode"
                  className={`nav-link nav-link-icon px-2 ${
                    theme === 'DARK' ? 'text-warning' : ''
                  }`}
                  onClick={toggleTheme}
                >
                  <Moon size={15} className="chevron-down" strokeWidth="3" />
                </span>
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
      {onSecondTour && (
        <Joyride
          run={run2}
          key="tour-2"
          steps={stepsSecondTour}
          callback={handleJoyrideCallback2}
          continuous={true}
          stepIndex={stepIndex2}
          //disableScrolling={true}
          showProgress={stepIndex2 < 6 ? true : false}
          locale={{ last: 'Finish', skip: 'Skip Tour' }}
          showSkipButton={true}
          spotlightClicks={true}
          styles={styles}
        />
      )}
    </header>
  )
}

export default Header
