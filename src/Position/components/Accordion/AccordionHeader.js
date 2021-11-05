import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from 'react'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Offline, Online } from 'react-detect-offline'

import Tooltip from '../../../components/Tooltip'
import { PositionContext } from '../../context/PositionContext'
import { useSymbolContext } from '../../../Trade/context/SymbolContext'
import { pollingProp } from '../../../constants/positions'

const AccordionHeader = (props) => {
  const wrapperRef = useRef(null)
  useOutsideAlerter(wrapperRef)

  const { requestSort, liveUpdate } = props
  const { positions, isLoading, refreshData } = useContext(PositionContext)
  const {
    onRefreshBtnClicked,
    disablePositionRefreshBtn,
    positionTimeInterval,
  } = useSymbolContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const ToggleMenu = useCallback(() => {
    setIsMenuOpen((value) => !value)
  }, [isMenuOpen])

  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setIsMenuOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [ref])
  }

  const onRefreshBtn = () => {
    refreshData()
    onRefreshBtnClicked('position')
  }

  return (
    <>
      <div className="mb-4 row align-items-center">
        <div className="col">
          <h1 className="mb-0 h4">Positions</h1>
        </div>
        <div className="col-auto">
          <button
            type="button"
            className="btn btn-sm btn-neutral btn-icon d-none"
          >
            <span className="btn-inner--text">Show profit in</span>
            <span className="btn-inner--icon">
              <i className="fab fa-bitcoin"></i>
            </span>
          </button>
          {positions.length > 0 ? (
            <>
              <Online polling={pollingProp}>
                <span
                  className="px-3 badge badge-dot"
                  data-for="position-connected-online-status"
                  data-tip={
                    liveUpdate
                      ? 'Live price update is working.'
                      : "Live price update isn't working."
                  }
                  style={{ fontWeight: '600' }}
                >
                  <i
                    className={` ${liveUpdate ? 'bg-success' : 'bg-danger'} `}
                  ></i>
                  Connected
                </span>
                <Tooltip id="position-connected-online-status" />
              </Online>
              <Offline polling={pollingProp}>
                <span
                  className="px-3 badge badge-dot"
                  data-for="position-connected-offline-status"
                  data-tip="Live price update isn't working."
                  style={{ fontWeight: '600' }}
                >
                  <i className="bg-danger"></i>
                  Connected
                </span>
                <Tooltip id="position-connected-offline-status" />
              </Offline>
            </>
          ) : null}

          <button
            type="button"
            className="ml-0 btn btn-sm btn-neutral btn-icon"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
            onClick={ToggleMenu}
          >
            <span className="btn-inner--text">Sort</span>
            <span className="btn-inner--icon">
              <i className="fas fa-sort"></i>
            </span>
          </button>
          <div
            className={`collapse ${
              isMenuOpen ? 'dropdown-menu show' : 'dropdown-menu'
            }`}
            aria-labelledby="dropdownMenuButton"
            style={{
              position: 'absolute',
              transform: 'translate3d(131px, 41px, 0px)',
              top: '0px',
              left: '0px',
            }}
            ref={wrapperRef}
          >
            <button
              className="dropdown-item"
              onClick={() => {
                requestSort('market')
                setIsMenuOpen(false)
              }}
            >
              <i className="fas fa-sort-alpha-down fa-fw"></i>Alphabetical
            </button>

            <button
              className="dropdown-item"
              onClick={() => {
                requestSort('ROE', 'descending')
                setIsMenuOpen(false)
              }}
            >
              <i className="fas fa-percentage fa-fw"></i>Highest ROE first
            </button>

            <button
              className="dropdown-item"
              onClick={() => {
                requestSort('position', 'descending')
                setIsMenuOpen(false)
              }}
            >
              <i className="fas fa-sort-amount-down fa-fw"></i>Biggest position
              first
            </button>

            <button
              className="dropdown-item"
              onClick={() => {
                requestSort('date', 'descending')
                setIsMenuOpen(false)
              }}
            >
              <i className="fas fa-sort-numeric-down fa-fw"></i>Newest to Oldest
            </button>

            <button
              className="dropdown-item"
              onClick={() => {
                requestSort('date')
                setIsMenuOpen(false)
              }}
            >
              <i className="fas fa-sort-numeric-down-alt fa-fw"></i>Oldest to
              Newest
            </button>
          </div>
          {isLoading ? (
            <button
              className="ml-2 btn btn-sm btn-neutral btn-icon"
              type="button"
              disabled
            >
              Refresh{'  '}
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            </button>
          ) : (
            <>
              {disablePositionRefreshBtn && <Tooltip id="position" />}
              <button
                type="button"
                data-for="position"
                data-tip={`You can only use this button every ${
                  positionTimeInterval / 1000
                } seconds`}
                className={`ml-2 btn btn-sm btn-neutral btn-icon ${
                  disablePositionRefreshBtn ? 'disabled' : ''
                }`}
                onClick={() =>
                  disablePositionRefreshBtn ? null : onRefreshBtn()
                }
              >
                <span className="btn-inner--text">Refresh</span>
                <span className="btn-inner--icon">
                  <FontAwesomeIcon icon={faSync} />
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default AccordionHeader
