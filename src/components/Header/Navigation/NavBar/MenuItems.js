import React, { useContext, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { MenuData } from './MenuData'
import { ThemeContext } from '../../../../contexts/ThemeContext'

const MenuItems = () => {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    let button = document.getElementsByClassName('button-close')[0];
      if(button) {
        button.addEventListener('click', handleCommunityModalClose)
      }
  }, [])

  const handleCommunityModalOpen = () => {
    let modal = document.getElementsByClassName('circle-widget-overlay')[0]
    modal.classList.remove('hidden');
    modal.classList.add('shown');
    modal.style.visibility = "visible"
  }

  const handleCommunityModalClose = () => {
    let modal = document.getElementsByClassName('circle-widget-overlay')[0]
    modal.classList.add('hidden');
    modal.classList.remove('shown');
    modal.style.visibility = "hidden"
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
            ) : item.modal ? (
              <a
                id={item.id}
                className="nav-link"
                href="#"
                onClick={handleCommunityModalOpen}
              >
                {item.title}
              </a>
            ) : (
              <NavLink
                id={item.id}
                activeClassName="nav-link active"
                className="nav-link btn"
                to={item.url}
              >
                {item.title}
                {item.title === 'Positions' && (
                  <span
                    className={`mt-3 badge badge-sm badge-danger badge-pill badge-floating ${theme === "DARK" ? 'border-dark' : 'border-white'}`}
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
