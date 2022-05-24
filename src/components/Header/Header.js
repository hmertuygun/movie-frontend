import React, { useState, useContext, useEffect, useCallback } from 'react'
import {
  faTelegramPlane,
  faTelegram,
  faMediumM,
} from '@fortawesome/free-brands-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Menu from './Menu/Menu'
import Logo from './Logo/Logo'
import MenuItems from './Navigation/NavBar/MenuItems'
import MobileTab from './MobileTab/MobileTab'
import { UserContext } from 'contexts/UserContext'
import { ThemeContext } from 'contexts/ThemeContext'
import { useSymbolContext } from 'contexts/SymbolContext'
import { useHistory } from 'react-router-dom'
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride'
import { secondTourSteps } from 'utils/tourSteps'
import { Moon, Sun, Twitter } from 'react-feather'
import './Header.css'
import { storage } from 'services/storages'
import Help from './Help'

const Header = () => {
  const {
    isLoggedIn,
    onSecondTour,
    tour2CurrentStep,
    setTour2CurrentStep,
    handleOnboardingShow,
    isOnboardingSkipped,
    state,
  } = useContext(UserContext)
  const { theme, setTheme } = useContext(ThemeContext)
  const { watchListOpen, setWatchListOpen } = useSymbolContext()

  const [stepIndex2, setStepIndex2] = useState(0)
  const [run2, setRun2] = useState(true)
  const [stepsSecondTour] = useState(secondTourSteps)
  const [showHelp, setShowHelp] = useState(false)

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
      storage.set('theme', newTheme)

      return newTheme
    })
  }

  const addDarkClassToBody = useCallback(() => {
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
  }, [theme])

  useEffect(() => {
    addDarkClassToBody()
  }, [addDarkClassToBody, theme])

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
    if (history.location.pathname === '/market') {
      setWatchListOpen(true)
    } else {
      setWatchListOpen(false)
    }
  }, [history, stepIndex2, tour2CurrentStep])

  if (!isLoggedIn) {
    return null
  }

  const handleStartTrading = () => {
    handleOnboardingShow()
  }

  return (
    <header className="" id="header-main">
      <nav
        className={`shadow navbar navbar-main navbar-expand-lg ${
          theme === 'LIGHT' ? 'navbar-light bg-whtie' : 'navbar-dark bg-dark'
        }`}
        id="navbar-main"
      >
        <div className="container">
          <Logo />
          <Help isForMobile={true} />
          {!state.firstLogin && (
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
                  {/* <a
                  href="https://support.coinpanel.com/hc/en-us/requests/new"
                  className="mr-3 btn btn-xs btn-primary btn-icon"
                  target="_blank"
                  rel="noreferrer"
                >
                  {' '}
                  <span className="btn-inner--text">Report a problem</span>
                </a> */}
                  {isOnboardingSkipped && (
                    <a
                      className="mr-3 btn btn-xs btn-primary btn-icon"
                      onClick={handleStartTrading}
                    >
                      {' '}
                      <span
                        className="btn-inner--text"
                        style={{ color: '#fff' }}
                      >
                        Integrate your exchange to start trading
                      </span>
                    </a>
                  )}
                </li>
                <li className="nav-item">
                  <div
                    className={`switch-container ${
                      theme === 'DARK'
                        ? 'switch-container-light'
                        : 'switch-container-dark'
                    }`}
                    onClick={toggleTheme}
                  >
                    {theme === 'DARK' ? (
                      <>
                        <Sun size={13} strokeWidth="3" />
                        <span className="switch-container-circle">&nbsp;</span>
                      </>
                    ) : (
                      <>
                        <span className="switch-container-circle">&nbsp;</span>
                        <Moon size={13} strokeWidth="3" />
                      </>
                    )}
                  </div>
                </li>
                {!isOnboardingSkipped && (
                  <>
                    <li className="nav-item">
                      <a
                        href="https://coin-panel.medium.com/"
                        type="button"
                        className="px-1 nav-link nav-link-icon"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FontAwesomeIcon
                          icon={faMediumM}
                          className={`mt-2 ${
                            theme === 'DARK' ? 'text-white' : 'text-dark'
                          }`}
                        />
                      </a>
                    </li>{' '}
                    <li className="nav-item">
                      <a
                        href="https://twitter.com/coin_panel"
                        type="button"
                        className="px-1 nav-link nav-link-icon"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Twitter
                          size={15}
                          className={
                            theme === 'DARK' ? 'text-white' : 'text-dark'
                          }
                        />
                      </a>
                    </li>{' '}
                    <li className="nav-item">
                      <a
                        href="https://t.me/coin_panel"
                        type="button"
                        className="px-1 nav-link nav-link-icon"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FontAwesomeIcon
                          icon={faTelegramPlane}
                          className={`mt-2 ${
                            theme === 'DARK' ? 'text-white' : 'text-dark'
                          }`}
                        />
                      </a>
                    </li>
                  </>
                )}
                {/* <li className="nav-item">
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
              </li> */}
                <Menu />
                <li className="nav-item">
                  <Help />
                </li>
              </ul>
              {/* <Notifications /> */}
            </div>
          )}
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
