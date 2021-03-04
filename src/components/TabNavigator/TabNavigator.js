import React, { useState, Fragment, useEffect } from 'react'
import { ChevronDown } from 'react-feather'
import './TabNavigator.css'

const TabNavigator = ({ index, labelArray = [], children }) => {
  const [contentIndex, setContentIndex] = useState(index || 0)
  const [selectedDropDownOption, setSelectedDropdownOption] = useState(
    'Stop-limit'
  )

  const handleButtonClick = ({ target }) => {
    if (target.id === 'Stop-limit') {
      setContentIndex(2)
    } else if(target.id === 'Stop-market') {
      setContentIndex(3)
    } else if (target.id === 'Take-Profit-Limit') {
      setContentIndex(4)
    } else {
      setContentIndex(5)
    }
    setSelectedDropdownOption(target.id)
  }

  return (
    <>
      <div className="TabNavigator-container">
        <nav
          className={
            labelArray[2] === 'custom-tab' ||
            labelArray[2] === 'custom-tab-sell'
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
              ) : label === 'custom-tab-sell' ? (
                <div className="custom-dropdown-wrapper">
                  <button
                    id={selectedDropDownOption}
                    onClick={handleButtonClick}
                    className={`button ${
                      contentIndex >= 2 ? 'btn-active' : ''
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
                      <button
                        onClick={handleButtonClick}
                        id="Take-Profit-Limit"
                        className={
                          contentIndex === 4 ? 'btn-active' : 'dropdown-btn'
                        }
                      >
                        Take-Profit-Limit
                      </button>
                      <button
                        onClick={handleButtonClick}
                        id="Take-Profit-Market"
                        className={
                          contentIndex === 5 ? 'btn-active' : 'dropdown-btn'
                        }
                      >
                        Take-Profit-Market
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
                  key={`${label}-${labelIndex}-key`}
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
