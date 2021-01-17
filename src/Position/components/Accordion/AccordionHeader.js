import React, { useState, useEffect, useRef } from 'react'

const AccordionHeader = (props) => {
  const wrapperRef = useRef(null)
  useOutsideAlerter(wrapperRef)

  const { requestSort } = props

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [liveUpdate] = useState(false)

  const ToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

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

  return (
    <>
      <div className="row align-items-center mb-4">
        <div className="col">
          <h1 className="h4 mb-0">Positions</h1>
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
          <span
            className="badge badge-dot px-3"
            data-toggle="tooltip"
            data-placement="top"
            title="Live price update is working."
            style={{ fontWeight: '600' }}
          >
            <i className={` ${liveUpdate ? 'bg-success' : 'bg-danger'} `}></i>
            Connected
          </span>

          <button
            type="button"
            className="btn btn-sm btn-neutral btn-icon ml-0"
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
                requestSort('ROE')
                setIsMenuOpen(false)
              }}
            >
              <i className="fas fa-percentage fa-fw"></i>Highest ROE first
            </button>

            <button
              className="dropdown-item"
              onClick={() => {
                requestSort('market')
                setIsMenuOpen(false)
              }}
            >
              <i className="fas fa-sort-amount-down fa-fw"></i>Biggest position
              first
            </button>

            <button
              className="dropdown-item"
              onClick={() => {
                requestSort('date')
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
          <button type="button" className="btn btn-sm btn-neutral btn-icon">
            <span className="btn-inner--text">Refresh</span>
            <span className="btn-inner--icon">
              <i data-feather="refresh-ccw"></i>
            </span>
          </button>
        </div>
      </div>
    </>
  )
}

export default AccordionHeader
