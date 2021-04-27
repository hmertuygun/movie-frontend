import React, { useState } from 'react'
import { ChevronDown, Info } from 'react-feather'
import './TabNavigator.css'

const TabInfo = () => {
  const [infoShow, setInfoShow] = useState(false)

  return (
    <div
      className={`tab-info-wrapper ${infoShow ? 'show' : ''}`}
      onMouseEnter={() => setInfoShow(true)}
      onMouseLeave={() => setInfoShow(false)}
    >
      <Info size="18" />
      {infoShow && (
        <div className="tab-info">
          <a
            href="https://support.coinpanel.com/hc/en-us/articles/360018713960-What-is-a-Stop-Limit-Order-"
            target="_blank"
            rel="noopener noreferrer"
          >
            Stop Limit
          </a>
          <p>
            Stop Limit Orders execute when a specified stop price is reached.
            Specify a trigger price to activate the order.
          </p>
          <a
            href="https://support.coinpanel.com/hc/en-us/articles/360018782039-What-is-a-Stop-Market-order-"
            target="_blank"
            rel="noopener noreferrer"
          >
            Stop Market
          </a>
          <p>
            Stop Market Orders execute when a specified price is reached.
            Specify a trigger price to activate the order.
          </p>
        </div>
      )}
    </div>
  )
}

const TabNavigator = ({
  index = 0,
  labelArray = [],
  children,
  hadDropDown = true,
}) => {
  const [contentIndex, setContentIndex] = useState(index)
  const [selectedDropDownOption, setSelectedDropdownOption] = useState(
    labelArray[2]
  )

  const handleButtonClick = ({ target }) => {
    const index = labelArray.indexOf(target.id)
    setContentIndex(index)
    setSelectedDropdownOption(target.id)
  }

  return (
    <>
      <div className="TabNavigator-container">
        {hadDropDown ? (
          <nav className="TabNavigator-nav TradeTabNav">
            {labelArray.slice(0, 2).map((label, labelIndex) => (
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
            ))}
            {labelArray.length > 2 ? (
              <div
                className={`custom-dropdown-wrapper ${
                  contentIndex >= 2 ? 'TabNavigator-link--active' : ''
                }`}
              >
                <TabInfo />
                <button
                  id={selectedDropDownOption}
                  onClick={handleButtonClick}
                  className="button"
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
                    {labelArray
                      .slice(2, labelArray.length)
                      .map((label, labelIndex) => (
                        <button
                          key={`${label}-${labelIndex}-key`}
                          onClick={handleButtonClick}
                          id={label}
                          className={
                            contentIndex === labelIndex + 2
                              ? 'btn-active'
                              : 'dropdown-btn'
                          }
                        >
                          {label}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            ) : null}
          </nav>
        ) : (
          <nav className="TabNavigator-nav">
            {labelArray.map((label, labelIndex) => (
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
            ))}
          </nav>
        )}
      </div>

      <>{children[contentIndex]}</>
    </>
  )
}

export default TabNavigator
