import React, { useContext, useState, useEffect } from 'react'
import { NavLink, useHistory } from 'react-router-dom'
import {
  faPercentage,
  faChartLine,
  faChartPie,
  faCog,
  faMapMarkedAlt,
  faPoll,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { TabContext } from '../../../contexts/TabContext'
import { UserContext } from '../../../contexts/UserContext'

import './MobileTab.css'
import { useMemo } from 'react'
import { ThemeContext } from '../../../contexts/ThemeContext'

const MobileTab = () => {
  const { setIsTradePanelOpen } = useContext(TabContext)
  const { handleOnboardingShow, isOnboardingSkipped } = useContext(UserContext)
  const { theme } = useContext(ThemeContext)
  const [activePage, setActivePage] = useState('Portfolio')
  const history = useHistory()

  const menuData = useMemo(() => {
    return [
      {
        name: 'TRADE',
        svg: {
          dark: 'img/svg/menu/trade_text_black_and_white.svg',
          light: 'img/svg/menu/trade_text_blue.svg',
        },
        function: () => {
          if (isOnboardingSkipped) {
            handleOnboardingShow()
          } else {
            setIsTradePanelOpen((value) => {
              if (!value) {
                history.push('/trade')
                window.scrollTo(0, 0)
                setActivePage('')
                return true
              } else {
                setActivePage('Home')
                return false
              }
            })
          }
        },
      },
      {
        name: 'HOME',
        svg: {
          dark: 'img/svg/menu/home_text_white.svg',
          light: 'img/svg/menu/home_text_black.svg',
          active: 'img/svg/menu/home_text_blue.svg',
        },
        function: () => {
          setActivePage('HOME')
          if (setIsTradePanelOpen) setIsTradePanelOpen(false)
          return history.push('/trade')
        },
      },
      {
        name: 'ANALYTICS',
        svg: {
          dark: 'img/svg/menu/analytics_text_white.svg',
          light: 'img/svg/menu/analytics_text_black.svg',
          active: 'img/svg/menu/analytics_text_blue.svg',
        },
        function: () => {
          setActivePage('ANALYTICS')
          return history.push('/analytics')
        },
      },
      {
        name: 'PORTFOLIO',
        svg: {
          dark: 'img/svg/menu/portfolio_text_white.svg',
          light: 'img/svg/menu/portfolio_text_black.svg',
          active: 'img/svg/menu/portfolio_text_blue.svg',
        },
        function: () => {
          setActivePage('PORTFOLIO')
          return history.push('/portfolio')
        },
      },
      {
        name: 'MARKET',
        svg: {
          dark: 'img/svg/menu/market_text_white.svg',
          light: 'img/svg/menu/market_text_black.svg',
          active: 'img/svg/menu/market_text_blue.svg',
        },
        function: () => {
          setActivePage('MARKET')
          return history.push('/market')
        },
      },
      {
        name: 'SETTINGS',
        svg: {
          dark: 'img/svg/menu/settings_text_white.svg',
          light: 'img/svg/menu/settings_text_black.svg',
          active: 'img/svg/menu/settings_text_blue.svg',
        },
        function: () => {
          setActivePage('SETTINGS')
          return history.push('/settings')
        },
      },
    ]
  })

  useEffect(() => {
    setActivePage(
      history.location.pathname == '/trade'
        ? 'Home'
        : history.location.pathname.split('/')[1].toUpperCase()
    )
  }, [history])

  const handleClick = (object) => {
    object.function()
  }

  return (
    <div className="mobile-tab">
      <div className="row tab-bar">
        <div className="col-12">
          <div className="d-flex justify-content-around">
            {menuData.map((element) => {
              return (
                <span
                  activeClassName="nav-link active"
                  className="nav-link"
                  onClick={() => {
                    handleClick(element)
                  }}
                >
                  <div className="svg-icon">
                    <img
                      alt={element.name}
                      src={
                        activePage === element.name
                          ? element.svg.active
                          : element.svg[theme.toLowerCase()]
                      }
                    ></img>
                  </div>
                </span>
              )
            })}
          </div>
        </div>
        <div className="col-6">
          <div className="pl-3 d-flex justify-content-around"></div>
        </div>
      </div>
    </div>
  )
}

export default MobileTab
