import React, { useState, useEffect } from 'react'
import AccordionContent from './AccordionContent'

const Accordion = (props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPositionSuccess, setIsPositionSuccess] = useState(true)
  const toggleRow = () => {
    setIsOpen(!isOpen)
  }

  const { market, ROE, PNL, entryPrice, currentPrice, units, date } = props

  useEffect(() => {
    const { ROE } = props

    const sign = ROE > 0 ? true : ROE === 0 ? 0 : false
    setIsPositionSuccess(sign)
  })

  return (
    <>
      <div className="card">
        <div
          className="card-header py-0 pl-0 pr-0 pr-md-6"
          id="heading"
          data-toggle="collapse"
          role="button"
          data-target="#collapse"
          aria-expanded="false"
          aria-controls="collapse"
          onClick={toggleRow}
        >
          <div className="card-body d-flex align-items-center flex-wrap flex-lg-nowrap py-0 pr-0">
            <div className="col-auto col-lg-2 d-flex align-items-center px-0 pt-3 pt-lg-0 zindex-100 mr-3">
              <span className="badge badge-md text-sm badge-light mr-2 positionMarketName">
                {market}
              </span>
              <div className="">
                <span
                  className={`icon icon-shape icon-sm text-success" ${
                    isPositionSuccess ? 'bg-soft-success' : 'bg-soft-danger'
                  }`}
                >
                  <i className="fas fa-caret-up"></i>
                </span>
              </div>
            </div>
            <div className="col-lg-1 col-auto pl-0 px-md-0 ml-md-0 ml-2 px-0 pt-3 pt-lg-0">
              <div className="align-items-center mb-0 text-center">
                <span
                  className={`${
                    isPositionSuccess ? 'text-success' : 'text-danger'
                  } text-success text-md font-weight-bold`}
                >
                  {ROE}%
                </span>
              </div>
            </div>
            <div className="col-lg-2 col-auto pl-0 pl-md-2 ml-md-0 ml-2 px-0 pt-3 pt-lg-0">
              <div className="align-items-center mb-0 text-center">
                <span
                  className={`${
                    isPositionSuccess ? 'text-success' : 'text-danger'
                  } text-md font-weight-bold`}
                >
                  {PNL}
                </span>
              </div>
            </div>
            <div className="col-12 col-lg-7 d-flex align-items-center position-static py-3 py-lg-3 px-0">
              <div className="col col-lg-12 position-static px-0 text-lg-center">
                <div className="d-flex flex-wrap flex-lg-nowrap align-items-center ">
                  <div className="col-12 col-lg-3 px-0 position-static">
                    <span className="d-lg-none h6">Entry Price: </span>
                    <span id="value">{entryPrice}</span>
                  </div>
                  <div className="col-12 col-lg-3 px-0 position-static">
                    <span className="d-lg-none h6">Current Price: </span>
                    <span id="value">{currentPrice}</span>
                  </div>
                  <div className="col-12 col-lg-3 px-0 position-static">
                    <span className="d-lg-none h6">Amount: </span>
                    <span id="value">{units}</span>
                  </div>
                  <div className="col-12 col-lg-3 px-0 position-static text-muted text-sm">
                    <span className="d-lg-none h6">Opened: </span>
                    <span
                      className="badge badge-xs text-xs badge-light mr-2"
                      id="value"
                    >
                      {' '}
                      {date}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          id="collapse"
          className={`collapse ${isOpen ? 'show' : ''}`}
          aria-labelledby="heading"
          data-parent="#accordion"
        >
          <AccordionContent open={isOpen} />
        </div>
      </div>
    </>
  )
}

export default Accordion
