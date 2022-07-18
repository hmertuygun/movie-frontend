import React, { useContext, useState, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import icons from 'constants/menuIcons'
import { TabContext } from 'contexts/TabContext'
import { ThemeContext } from 'contexts/ThemeContext'

import './MobileTab.css'
import { useDispatch, useSelector } from 'react-redux'
import { handleOnboardingShow } from 'store/actions'

const MobileTab = () => {
  const { setIsTradePanelOpen } = useContext(TabContext)
  const { theme } = useContext(ThemeContext)
  const [activePage, setActivePage] = useState('Portfolio')
  const { isOnboardingSkipped } = useSelector((state) => state.appFlow)
  const history = useHistory()
  const dispatch = useDispatch()

  const menuData = useMemo(() => {
    return [
      {
        name: 'TRADE',
        svg: {
          dark: {
            active: icons.ATradeDark,
            inactive: icons.ITradeDark,
          },
          light: {
            active: icons.ATradeLight,
            inactive: icons.ITradeLight,
          },
        },
        control: false,
        function: () => {
          if (isOnboardingSkipped) {
            dispatch(handleOnboardingShow())
          } else {
            setIsTradePanelOpen((value) => {
              if (!value) {
                history.push('/trade')
                window.scrollTo(0, 0)
                setActivePage('')
                return true
              } else {
                setActivePage('Home')
                return true
              }
            })
          }
        },
      },
      {
        name: 'HOME',
        svg: {
          dark: {
            active: icons.AHomeDark,
            inactive: icons.IHomeDark,
          },
          light: {
            active: icons.AHomeLight,
            inactive: icons.IHomeLight,
          },
        },
        control: true,
        function: () => {
          setActivePage('HOME')
          if (setIsTradePanelOpen) setIsTradePanelOpen(false)
          return history.push('/trade')
        },
      },
      {
        name: 'ANALYTICS',
        svg: {
          dark: {
            active: icons.AAnalyticsDark,
            inactive: icons.IAnalyticsDark,
          },
          light: {
            active: icons.AAnalyticsLight,
            inactive: icons.IAnalyticsLight,
          },
        },
        control: true,
        function: () => {
          setActivePage('ANALYTICS')
          return history.push('/analytics')
        },
      },
      {
        name: 'PORTFOLIO',
        svg: {
          dark: {
            active: icons.APortfolioDark,
            inactive: icons.IPortfolioDark,
          },
          light: {
            active: icons.APortfolioLight,
            inactive: icons.IPortfolioLight,
          },
        },
        control: true,
        function: () => {
          setActivePage('PORTFOLIO')
          return history.push('/portfolio')
        },
      },
      {
        name: 'MARKET',
        svg: {
          dark: {
            active: icons.AMarketDark,
            inactive: icons.IMarketDark,
          },
          light: {
            active: icons.AMarketLight,
            inactive: icons.IMarketLight,
          },
        },
        control: false,
        function: () => {
          setActivePage('MARKET')
          window.scroll({
            top: 0,
            behavior: 'smooth',
          })
          return history.push('/market')
        },
      },
      {
        name: 'SETTINGS',
        svg: {
          dark: {
            active: icons.ASettingsDark,
            inactive: icons.ISettingsDark,
          },
          light: {
            active: icons.ASettingsLight,
            inactive: icons.ISettingsLight,
          },
        },
        control: false,
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
        ? 'HOME'
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
              if (element.control && isOnboardingSkipped) return null
              return (
                <span
                  key={element.name}
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
                          ? element.svg[theme.toLowerCase()].active
                          : element.svg[theme.toLowerCase()].inactive
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
