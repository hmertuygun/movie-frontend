import React, { useContext } from 'react'
import { NavLink, useHistory } from 'react-router-dom'
import {
  faPercentage,
  faChartLine,
  faChartPie,
  faCog,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { TabContext } from '../../../contexts/TabContext'
import { UserContext } from '../../../contexts/UserContext'

import './MobileTab.css'

const MobileTab = () => {
  const { setIsTradePanelOpen } = useContext(TabContext)
  const { handleOnboardingShow, isOnboardingSkipped } = useContext(UserContext)
  const history = useHistory()

  const handlePlusClick = () => {
    if (isOnboardingSkipped) {
      handleOnboardingShow()
    } else {
      history.push('/trade')
      window.scrollTo(0, 0)
      setIsTradePanelOpen(true)
    }
  }

  return (
    <div className="mobile-tab">
      <div
        id="expand-button"
        className="expandable svg-icon compressed"
        onClick={handlePlusClick}
      >
        <svg viewBox="0 0 24 24">
          <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
        </svg>
      </div>
      <div className="row tab-bar">
        <div className="col-6">
          <div className="pr-3 d-flex justify-content-around">
            <NavLink
              activeClassName="nav-link active"
              className="nav-link"
              to="/trade"
            >
              <div className="svg-icon">
                <FontAwesomeIcon icon={faChartLine} size="2x" />
              </div>
            </NavLink>
            <NavLink
              activeClassName="nav-link active"
              className="nav-link"
              to="/positions"
            >
              <div className="svg-icon">
                <FontAwesomeIcon icon={faPercentage} size="2x" />
              </div>
            </NavLink>
          </div>
        </div>
        <div className="col-6">
          <div className="pl-3 d-flex justify-content-around">
            <NavLink
              activeClassName="nav-link active"
              className="nav-link"
              to="/portfolio"
            >
              <div className="svg-icon">
                <FontAwesomeIcon icon={faChartPie} size="2x" />
              </div>
            </NavLink>
            <NavLink
              activeClassName="nav-link active"
              className="nav-link"
              to="/settings"
            >
              <div className="svg-icon">
                <FontAwesomeIcon icon={faCog} size="2x" />
              </div>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileTab
