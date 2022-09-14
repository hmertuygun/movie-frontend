import { useState } from 'react'
import { ThemeContext } from 'contexts/ThemeContext'
import { useContext } from 'react'
import PropTypes from 'prop-types'

import './AnalystSelector.css'
import { ChevronDown, ChevronRight, User, Info } from 'react-feather'
import dayjs from 'dayjs'
import useComponentVisible from 'hooks/useComponentVisible'
import AnalystDetailCard from '../AnalystDetailCard'
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

const AnalystSelector = ({
  traders,
  handleChange,
  activeValue,
  userData,
  showInfo,
}) => {
  const { theme } = useContext(ThemeContext)
  const [showDetails, setShowDetails] = useState(false)
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false)

  const handleOpenMenu = () => {
    setIsComponentVisible(!isComponentVisible)
  }

  const handleSelectedAnalyst = (id) => {
    handleChange(id)
    setIsComponentVisible(false)
    setShowDetails(false)
  }

  const isUserTheAnalyst = traders.some(
    (trader) => trader?.id === userData.email
  )

  const currentAnalyst = traders.find((trader) => trader?.id === activeValue)

  const handleShowDetails = (e, value) => {
    e.stopPropagation()
    setShowDetails(value)
  }

  const handleHideDetails = (e) => {
    e.stopPropagation()
    setShowDetails(null)
  }

  let textClass = theme === 'DARK' ? 'text-white' : 'text-black'
  let textPrimary = theme === 'DARK' ? 'text-white' : 'text-primary'
  return (
    <>
      <div className="analyst-dropdown-container" ref={ref}>
        <div
          className={`analyst-field-selected ${
            isUserTheAnalyst ? 'field-disabled' : ''
          }`}
          onClick={isUserTheAnalyst ? () => null : handleOpenMenu}
        >
          {currentAnalyst?.metaData?.logo ? (
            <img
              alt="Analyst"
              src={currentAnalyst.metaData.logo}
              className="avatar rounded-circle avatar-xs mr-2"
            />
          ) : (
            <User size={20} className={`mr-1 ${textClass}`} />
          )}
          <p>{currentAnalyst?.name ? currentAnalyst?.name : 'Me'}</p>
          {isComponentVisible ? (
            <ChevronRight size={24} className={`ml-auto ${textClass}`} />
          ) : (
            <ChevronDown size={24} className={`ml-auto ${textClass}`} />
          )}
        </div>
        {isComponentVisible && (
          <div
            className={`analyst-options ${theme === 'DARK' ? 'bg-dark' : ''}`}
          >
            <>
              <div
                className="analyst-option"
                onClick={() => handleSelectedAnalyst(userData.email)}
              >
                <input
                  type="checkbox"
                  className="custom-checkbox mr-2"
                  checked={activeValue === userData.email}
                  readOnly
                />
                <User size={16} className={`mr-1 ${textClass}`} />
                <p className="mr-auto mb-0 text-sm">Me</p>
              </div>
              {traders.map((trader) => {
                return (
                  <div
                    className={`analyst-option`}
                    style={
                      trader?.live
                        ? { opacity: 1, cursor: 'pointer' }
                        : { opacity: 0.5 }
                    }
                    onClick={
                      trader?.live
                        ? () => handleSelectedAnalyst(trader?.id)
                        : () => null
                    }
                    key={trader?.name}
                  >
                    <input
                      type="checkbox"
                      className="custom-checkbox mr-2"
                      checked={activeValue === trader?.id}
                      readOnly
                    />
                    <div className="d-flex mr-auto">
                      {trader?.metaData?.logo && (
                        <img
                          alt="Analyst"
                          src={trader.metaData.logo}
                          className="avatar rounded-circle avatar-xs mr-2"
                        />
                      )}
                      <div className="position-relative title-content">
                        <p className={`m-0 text-xs  ${textClass}`}>
                          {trader?.name}
                        </p>
                        <p className="sub-text m-0 position-absolute top-3">
                          {trader?.lastUpdated
                            ? `Updated ${dayjs(trader.lastUpdated).fromNow()}`
                            : ''}
                        </p>
                      </div>
                    </div>
                    {trader?.live ? (
                      <div
                        className={`analyst-info-wrapper`}
                        onMouseEnter={(e) => handleShowDetails(e, trader.id)}
                        onMouseLeave={(e) => handleHideDetails(e)}
                        onClick={
                          showDetails === trader.id
                            ? (e) => handleHideDetails(e)
                            : (e) => handleShowDetails(e, trader.id)
                        }
                      >
                        <Info size={18} className={`${textPrimary}`} />
                        {showDetails === trader.id && (
                          <div className="analyst-info">
                            <AnalystDetailCard selectedAnalyst={trader} />
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </>
          </div>
        )}
      </div>
      {currentAnalyst && showInfo && (
        <AnalystDetailCard selectedAnalyst={currentAnalyst} />
      )}
    </>
  )
}

AnalystSelector.propTypes = {
  traders: PropTypes.array,
  handleChange: PropTypes.func,
  activeValue: PropTypes.string,
  userData: PropTypes.object,
  showInfo: PropTypes.bool,
}

export default AnalystSelector
