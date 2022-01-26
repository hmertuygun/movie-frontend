import React, { useContext, useEffect, useState } from 'react'
import { ChevronDown, Info } from 'react-feather'
import { UserContext } from '../../contexts/UserContext'
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
            A stop-limit order consists of Trigger Price and Limit Price. The
            trigger price is simply the price that triggers a limit order, and
            the limit price is the specific price of the limit order that was
            triggered. This means that once your trigger price has been reached,
            your limit order will be immediately placed on the order book.
          </p>
          <a
            href="https://support.coinpanel.com/hc/en-us/articles/360018782039-What-is-a-Stop-Market-order-"
            target="_blank"
            rel="noopener noreferrer"
          >
            Stop Market
          </a>
          <p>
            A stop-market order uses a Trigger Price as a trigger. When the
            trigger price is reached, it triggers a market order.
          </p>
          {/* <a
            href="https://support.coinpanel.com/hc/en-us/articles/360020673540-What-is-a-Take-Profit-Limit-Order-"
            target="_blank"
            rel="noopener noreferrer"
          >
            Take Profit Limit
          </a>
          <p>
            A take-profit-limit order consists of Trigger Price and Limit Price.
            The trigger price is simply the price that triggers a limit order,
            and the limit price is the specific price of the limit order that
            was triggered. This means that once your trigger price has been
            reached, your limit order will be immediately placed on the order
            book.
          </p>
          <a
            href="https://support.coinpanel.com/hc/en-us/articles/360020676680-What-is-a-Take-Profit-Market-order-"
            target="_blank"
            rel="noopener noreferrer"
          >
            Take Profit Market
          </a>
          <p>
            A take-profit-market order uses a Trigger Price as a trigger. When
            the trigger price is reached, it triggers a market order. Make sure
            you learn about market orders before using take-profit-market
            orders.
          </p> */}
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
  const { showMarketItems, tour2CurrentStep, state } = useContext(UserContext)
  const [contentIndex, setContentIndex] = useState(index)
  const [selectedDropDownOption, setSelectedDropdownOption] = useState(
    labelArray[2]
  )

  useEffect(() => {
    if (tour2CurrentStep === 3) {
      document.getElementById('cp-tour-2-4').click()
    }
  }, [tour2CurrentStep])

  const handleButtonClick = ({ target }) => {
    const index = labelArray.indexOf(target.id)
    setContentIndex(index)
    setSelectedDropdownOption(target.id)
  }

  const getId = (label) => {
    switch (label) {
      case 'Place Order':
        return 'cp-tour3'
      case 'Full Trade':
        return 'cp-tour7'
      case 'Notifications':
        return 'cp-tour-2-4'
      default:
        return ''
    }
  }

  return (
    <>
      <div
        className="TabNavigator-container"
        id={labelArray[0] === 'Limit' ? 'cp-tour4' : ''}
      >
        {hadDropDown ? (
          <nav className="TabNavigator-nav DropDownNav">
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
                <div
                  className={`chevron-wrapper ${showMarketItems && 'show'}`}
                  id="cp-tour5-container"
                  tabIndex="0"
                >
                  <ChevronDown
                    size={15}
                    color="#718096"
                    className="chevron-down"
                  />
                  <div className="market-items" id="cp-tour6">
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
          <nav className="TabNavigator-nav HorizontalNav">
            {labelArray.map((label, labelIndex) => (
              <div
                id={getId(label)}
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
                {!state.has2FADetails && label === 'Security' ? (
                  <span className="text-danger">{label}</span>
                ) : (
                  <span>{label}</span>
                )}
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
