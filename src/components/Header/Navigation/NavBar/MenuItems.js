/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { MenuData, ChartMirroringMenuData } from './MenuData'
import { ThemeContext } from 'contexts/ThemeContext'
import { Tooltip } from 'components'
import { useSelector } from 'react-redux'

const MenuItems = () => {
  const { theme } = useContext(ThemeContext)
  const { isOnboardingSkipped } = useSelector((state) => state.appFlow)

  let menu = isOnboardingSkipped ? ChartMirroringMenuData : MenuData

  return (
    <ul className="navbar-nav ml-lg-auto mr-3">
      {isOnboardingSkipped && (
        <li className="nav-item nav-item-spaced d-none d-lg-block">
          <NavLink
            activeClassName={`nav-link active`}
            className={`nav-link btn`}
            to="/market"
          >
            Market
          </NavLink>
        </li>
      )}
      {menu.map((item) => {
        return (
          <li
            className="nav-item nav-item-spaced d-none d-lg-block"
            key={item.title}
          >
            {item.externalLink ? (
              <a
                id={item.id}
                className="nav-link"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.title}
              </a>
            ) : (
              <>
                {isOnboardingSkipped && <Tooltip id={item.id} />}
                <NavLink
                  id={item.id}
                  data-for={item.id}
                  data-tip="Integrate your exchange to start trading"
                  style={
                    isOnboardingSkipped ? { pointerEvents: 'inherit' } : null
                  }
                  activeClassName={`nav-link ${
                    !isOnboardingSkipped ? 'active' : ''
                  } ${
                    isOnboardingSkipped && item.title === 'Market'
                      ? 'active'
                      : ''
                  }`}
                  className={`nav-link btn ${
                    isOnboardingSkipped && item.title !== 'Market'
                      ? 'disabled'
                      : ''
                  }`}
                  to={item.url}
                >
                  {item.title}
                </NavLink>
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default MenuItems
