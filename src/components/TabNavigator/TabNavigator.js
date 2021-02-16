import React, { useState, Fragment } from 'react'
import { ChevronDown } from 'react-feather'
import { useLocation } from 'react-router-dom'
import './TabNavigator.css'

const TabNavigator = ({ index, labelArray = [], children }) => {
  const location = useLocation()
  
  const [contentIndex, setContentIndex] = useState(index | 0)
  const [selectedDropDownOption, setSelectedDropdownOption] = useState(
    'Stop-limit'
  )

  const handleButtonClick = ({ target }) => {
    if (target.id === 'Stop-limit') {
      setContentIndex(2)
    } else {
      setContentIndex(3)
    }
    setSelectedDropdownOption(target.id)
  }

  return (
    <>
      <div className="TabNavigator-container">
        <nav
          className={
            location.pathname === '/trade'
              ? 'TabNavigator-nav TradeTabNav'
              : 'TabNavigator-nav'
          }
        >
          {labelArray.map((label, labelIndex) => (
            <Fragment key={labelIndex}>
              {label === 'custom-tab' ? (
                <div className="custom-dropdown-wrapper">
                  <button
                    id={selectedDropDownOption}
                    onClick={handleButtonClick}
                    className={`button ${
                      contentIndex === 2 || contentIndex === 3
                        ? 'btn-active'
                        : ''
                    }`}
                  >
                    {selectedDropDownOption}
                  </button>
                  <div className="chevron-wrapper">
                    <ChevronDown
                      size={15}
                      color="#718096"
                      className="chevron-down"
                    />
                    <div className="market-items">
                      <button
                        onClick={handleButtonClick}
                        id="Stop-limit"
                        className={
                          contentIndex === 2 ? 'btn-active' : 'dropdown-btn'
                        }
                      >
                        Stop-limit
                      </button>
                      <button
                        onClick={handleButtonClick}
                        id="Stop-market"
                        className={
                          contentIndex === 3 ? 'btn-active' : 'dropdown-btn'
                        }
                      >
                        Stop-market
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={[
                    'TabNavigator-link',
                    contentIndex === labelIndex
                      ? 'TabNavigator-link--active'
                      : null,
                  ].join(' ')}
                  key={`${labelIndex}-key`}
                  onClick={() => {
                    setContentIndex(labelIndex)
                  }}
                >
                  {label}
                </div>
              )}
            </Fragment>
          ))}
        </nav>
      </div>

      <>{children[contentIndex]}</>
    </>
  )
}

export default TabNavigator
