/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { MenuData, ChartMirroringMenuData } from './MenuData'
import { ThemeContext } from '../../../../contexts/ThemeContext'
import { UserContext } from '../../../../contexts/UserContext'
import Tooltip from '../../../../components/Tooltip'

const MenuItems = () => {
  const { theme } = useContext(ThemeContext)
  const { isOnboardingSkipped } = useContext(UserContext)

  let menu = isOnboardingSkipped ? ChartMirroringMenuData : MenuData

  return (
    <ul className="navbar-nav ml-lg-auto mr-3">
      {isOnboardingSkipped && (
        <li className="nav-item nav-item-spaced d-none d-lg-block">
          <NavLink
            activeClassName={`nav-link active`}
            className={`nav-link btn`}
            to="/trade"
          >
            Chart Mirroring
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
                    isOnboardingSkipped && item.title === 'Chart Mirroring'
                      ? 'active'
                      : ''
                  }`}
                  className={`nav-link btn ${
                    isOnboardingSkipped && item.title !== 'Chart Mirroring'
                      ? 'disabled'
                      : ''
                  }`}
                  to={item.url}
                >
                  {item.title}
                  {item.title === 'Analytics' && !isOnboardingSkipped && (
                    <span
                      className={`mt-3 badge badge-sm badge-success badge-pill badge-floating ${
                        theme === 'DARK' ? 'border-dark' : 'border-white'
                      }`}
                      style={{ fontSize: '0.4rem', padding: '3px 5px' }}
                    >
                      NEW
                    </span>
                  )}
                  {item.title === 'Academy' && !isOnboardingSkipped && (
                    <span
                      className={`mt-3 badge badge-sm badge-success badge-pill badge-floating ${
                        theme === 'DARK' ? 'border-dark' : 'border-white'
                      }`}
                      style={{ fontSize: '0.4rem', padding: '3px 5px' }}
                    >
                      NEW
                    </span>
                  )}
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
