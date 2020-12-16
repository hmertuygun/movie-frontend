import React from 'react'
import { NavLink } from 'react-router-dom'
import { MenuData } from './MenuData'

function MenuItens() {
  return (
    <ul className="navbar-nav ml-lg-auto mr-3">
      {MenuData.map((item, idx) => {
        return (
          <li className="nav-item nav-item-spaced d-none d-lg-block" key={idx}>
            <NavLink
              activeClassNam="nav-link active"
              className="nav-link"
              to={item.url}
            >
              {item.title}
            </NavLink>
          </li>
        )
      })}
    </ul>
  )
}

export default MenuItens
