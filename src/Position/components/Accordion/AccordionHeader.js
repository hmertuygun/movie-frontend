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
            <span style={{ paddingRight: '6px' }}>Refresh</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="feather feather-refresh-ccw"
            >
              <polyline points="1 4 1 10 7 10"></polyline>
              <polyline points="23 20 23 14 17 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}

export default AccordionHeader
