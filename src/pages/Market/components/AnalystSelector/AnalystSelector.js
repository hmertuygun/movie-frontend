import { useCallback, useEffect, useState } from 'react'
import { ThemeContext } from 'contexts/ThemeContext'
import { useContext } from 'react'
import './AnalystSelector.css'
import {
  ChevronDown,
  MoreHorizontal,
  ChevronRight,
  User,
  ChevronLeft,
  Globe,
  Youtube,
  Instagram,
  Twitter,
} from 'react-feather'
import dayjs from 'dayjs'
import useComponentVisible from 'hooks/useComponentVisible'
import { getFirestoreDocumentData } from 'services/api'
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

const AnalystSelector = ({ traders, handleChange, activeValue, userData }) => {
  const { theme } = useContext(ThemeContext)
  const [selectAnalystDetail, setSelectAnalystDetail] = useState()
  const [allTraders, setAllTraders] = useState(traders)
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false)

  const handleOpenMenu = () => {
    setIsComponentVisible(!isComponentVisible)
  }

  const handleSelectedAnalyst = (id) => {
    handleChange(id)
    setIsComponentVisible(false)
  }

  const handleShowDetails = (e, id) => {
    e.stopPropagation()
    setSelectAnalystDetail(id)
    setIsComponentVisible(true)
  }
  const selectedAnalyst = allTraders.find(
    (trader) => trader.id === selectAnalystDetail
  )

  const isUserTheAnalyst = allTraders.some(
    (trader) => trader.id === userData.email
  )

  const currentAnalyst = allTraders.find((trader) => trader.id === activeValue)

  const getUpdatedTime = useCallback(
    (email) => {
      getFirestoreDocumentData('chart_drawings', email).then((list) => {
        if (list.data()) {
          let trader = allTraders.map((trade) => {
            if (trade.id === email) {
              return {
                lastUpdated: list.data()?.lastUpdated,
                ...trade,
              }
            }
            return trade
          })
          setAllTraders(trader)
        }
      })
    },
    [allTraders]
  )

  useEffect(() => {
    allTraders.map((trade) => getUpdatedTime(trade.id))
  }, [isComponentVisible])

  let textClass = theme === 'DARK' ? 'text-white' : 'text-black'
  let textPrimary = theme === 'DARK' ? 'text-white' : 'text-primary'

  return (
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
        {currentAnalyst?.name && (
          <MoreHorizontal
            size={15}
            className={`${textClass}`}
            onClick={(e) => handleShowDetails(e, currentAnalyst.id)}
          />
        )}
        {isComponentVisible ? (
          <ChevronRight size={24} className={`ml-auto ${textClass}`} />
        ) : (
          <ChevronDown size={24} className={`ml-auto ${textClass}`} />
        )}
      </div>
      {isComponentVisible && (
        <div className={`analyst-options ${theme === 'DARK' ? 'bg-dark' : ''}`}>
          {!selectAnalystDetail ? (
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
              {allTraders.map((trader) => {
                return (
                  <div
                    className={`analyst-option`}
                    onClick={() => handleSelectedAnalyst(trader.id)}
                    key={trader.title}
                  >
                    <input
                      type="checkbox"
                      className="custom-checkbox mr-2"
                      checked={activeValue === trader.id}
                      readOnly
                    />
                    {trader?.metaData?.logo && (
                      <img
                        alt="Analyst"
                        src={trader.metaData.logo}
                        className="avatar rounded-circle avatar-xs mr-2"
                      />
                    )}
                    <div className="mr-auto position-relative">
                      <p className={`m-0 text-xs  ${textClass}`}>
                        {trader.name}
                      </p>
                      <p className="sub-text m-0 position-absolute top-3">
                        {trader.lastUpdated
                          ? `Updated ${dayjs(trader.lastUpdated).fromNow()}`
                          : ''}
                      </p>
                    </div>
                    <MoreHorizontal
                      size={15}
                      className={`${textClass}`}
                      onClick={(e) => handleShowDetails(e, trader.id)}
                    />
                  </div>
                )
              })}
            </>
          ) : (
            <div className="detail-container">
              <p
                className="text-xs mb-0 icon-cursor"
                onClick={handleShowDetails}
              >
                <ChevronLeft size={14} className={`${textClass}`} />
                Back
              </p>
              <div
                className="analyst-option analyst-detail-header"
                onClick={() => handleSelectedAnalyst(selectedAnalyst.id)}
              >
                <input
                  type="checkbox"
                  className="custom-checkbox mr-2"
                  checked={activeValue === selectedAnalyst.id}
                  readOnly
                />
                <img
                  alt="Analyst"
                  src={selectedAnalyst?.metaData?.logo}
                  className="avatar rounded-circle avatar-xs mr-2"
                />
                <div className="mr-auto position-relative">
                  <p className={`m-0 text-xs ${textClass}`}>
                    {selectedAnalyst?.name}
                  </p>
                </div>
                <p className="text-primary text-sm mb-0">
                  {activeValue === selectedAnalyst.id ? 'Selected' : ''}
                </p>
              </div>
              <div className="more-details">
                <div className="d-flex analyst-data">
                  <div className="mr-1">
                    {selectedAnalyst?.metaData?.profilePicture ? (
                      <img
                        alt="Analyst"
                        src={selectedAnalyst.metaData.profilePicture}
                        className="avatar rounded-circle avatar-lg"
                      />
                    ) : (
                      <span className="avatar bg-primary text-white rounded-circle avatar-lg">
                        {selectedAnalyst.name.substring(0, 1)}
                      </span>
                    )}
                  </div>
                  <div className="ml-1">
                    <div className="d-flex align-items-center justify-content-between">
                      <h3 className="text-sm mb-1 analyst-name">
                        <strong>{selectedAnalyst?.name}</strong>
                      </h3>
                      <p className="sub-text mb-0">
                        {selectedAnalyst.lastUpdated
                          ? `Updated ${dayjs(
                              selectedAnalyst.lastUpdated
                            ).fromNow()}`
                          : ''}
                      </p>
                    </div>
                    <p className="text-xs">
                      {selectedAnalyst?.metaData?.description}
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-end">
                  {selectedAnalyst?.metaData?.social?.website && (
                    <a
                      href={selectedAnalyst.metaData.social.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe
                        size={18}
                        className={`mr-1 icon-cursor ${textPrimary}`}
                      />
                    </a>
                  )}
                  {selectedAnalyst?.metaData?.social?.youtube && (
                    <a
                      href={selectedAnalyst.metaData.social.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Youtube
                        size={18}
                        className={`mr-1 icon-cursor ${textPrimary}`}
                      />
                    </a>
                  )}
                  {selectedAnalyst?.metaData?.social?.instagram && (
                    <a
                      href={selectedAnalyst.metaData.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram
                        size={18}
                        className={`mr-1 icon-cursor ${textPrimary}`}
                      />
                    </a>
                  )}
                  {selectedAnalyst?.metaData?.social?.twitter && (
                    <a
                      href={selectedAnalyst.metaData.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter
                        size={18}
                        className={`mr-1 icon-cursor ${textPrimary}`}
                      />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AnalystSelector
