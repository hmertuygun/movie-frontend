/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { MenuData } from './MenuData'
import { ThemeContext } from '../../../../contexts/ThemeContext'
import { UserContext } from '../../../../contexts/UserContext'

const MenuItems = () => {
  const { theme } = useContext(ThemeContext)
  const { handleOnboardingShow, isOnboardingSkipped } = useContext(UserContext)

  const onMenuClick = () => {
    handleOnboardingShow()
  }

  return (
    <ul className="navbar-nav ml-lg-auto mr-3">
      {MenuData.map((item) => {
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
              <NavLink
                id={item.id}
                activeClassName="nav-link active"
                className="nav-link btn"
                to={
                  isOnboardingSkipped && item.title !== 'Trade' ? '#' : item.url
                }
                onClick={
                  isOnboardingSkipped && item.title !== 'Trade'
                    ? onMenuClick
                    : null
                }
              >
                {item.title}
                {item.title === 'Positions' && (
                  <span
                    className={`mt-3 badge badge-sm badge-danger badge-pill badge-floating ${
                      theme === 'DARK' ? 'border-dark' : 'border-white'
                    }`}
                    style={{ fontSize: '0.4rem', padding: '3px 5px' }}
                  >
                    BETA
                  </span>
                )}
              </NavLink>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default MenuItems
