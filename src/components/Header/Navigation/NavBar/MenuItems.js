import React from 'react'
import { NavLink } from 'react-router-dom'
import { MenuData } from './MenuData'

const MenuItems = () => (
  <ul className="navbar-nav ml-lg-auto mr-3">
    {MenuData.map((item) => {
      return (
        <li
          className="nav-item nav-item-spaced d-none d-lg-block"
          key={item.title}
        >
          {item.externalLink ? (
            <a
              className="nav-link"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.title}
            </a>
          ) : (
            <NavLink
              activeClassName="nav-link active"
              className="nav-link"
              to={item.url}
            >
              {item.title}
            </NavLink>
          )}
        </li>
      )
    })}
  </ul>
)

export default MenuItems
