import React, { useState, useEffect } from 'react'
import { Popover } from 'react-tiny-popover'
import { Info } from 'react-feather'
import style from './Accordion.module.css'

import AccordionContent from './AccordionContent'

const Accordion = (props) => {
  const [isOpen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [isPositionSuccess, setIsPositionSuccess] = useState(true)

  const { market, ROE, PNL, entryPrice, orders, currentPrice, units, date } =
    props

  useEffect(() => {
    const { ROE } = props

    const sign = ROE > 0 ? true : ROE === 0 ? 0 : false
    setIsPositionSuccess(sign)
  }, [props])

  return (
    <>
      {/* Disable accordion click by commenting onClick */}
      <div className="card">
        <div
          className="py-0 pl-0 pr-0 card-header pr-md-6"
          id="heading"
          data-toggle="collapse"
          role="button"
          data-target="#collapse"
          aria-expanded="false"
          aria-controls="collapse"
          // onClick={toggleRow}
        >
          <div className="flex-wrap py-0 pr-0 card-body d-flex align-items-center flex-lg-nowrap">
            <div className="col-auto px-0 pt-3 mr-3 col-lg-2 d-flex align-items-center pt-lg-0 zindex-100">
              <span className="mr-2 text-sm badge badge-md badge-light positionMarketName">
                {market}
              </span>
              <div className="">
                <span
                  className={`icon icon-shape icon-sm bg-soft-success ${
                    isPositionSuccess
                      ? 'bg-soft-success text-success'
                      : 'bg-soft-danger text-danger'
                  }`}
                >
                  <i
                    className={`fas ${
                      isPositionSuccess ? 'fa-caret-up' : 'fa-caret-down'
                    }`}
                  ></i>
                </span>
              </div>
            </div>
            <div className="col-auto px-0 pt-3 pl-0 ml-2 col-lg-1 px-md-0 ml-md-0 pt-lg-0">
              <div className="mb-0 text-center align-items-center">
                <span
                  className={`${
                    isPositionSuccess ? 'text-success' : 'text-danger'
                  } text-success text-md font-weight-bold`}
                >
                  {ROE} %
                </span>
              </div>
            </div>
            <div className="col-auto px-0 pt-3 pl-0 ml-2 col-lg-2 pl-md-2 ml-md-0 pt-lg-0">
              <div className="mb-0 text-center align-items-center">
                <span
                  className={`${
                    isPositionSuccess ? 'text-success' : 'text-danger'
                  } text-md font-weight-bold`}
                >
                  {PNL}
                </span>
              </div>
            </div>
            <div className="px-0 py-3 col-12 col-lg-7 d-flex align-items-center position-static py-lg-3">
              <div className="px-0 col col-lg-12 position-static text-lg-center">
                <div className="flex-wrap d-flex flex-lg-nowrap align-items-center ">
                  <div
                    className="px-0 col-12 col-lg-3 position-static"
                    onMouseOver={() => setShowInfo(true)}
                    onMouseOut={() => setShowInfo(false)}
                  >
                    <span className="d-lg-none h6">Entry Price: </span>
                    <span id="value">{entryPrice}</span>
                    {` `}
                    <Popover
                      isOpen={showInfo}
                      positions={['bottom', 'top', 'right', 'left']}
                      padding={10}
                      onClickOutside={() => setShowInfo(false)}
                      containerClassName={style['app-popover']}
                      content={({ position, nudgedLeft, nudgedTop }) => {
                        return (
                          <table>
                            <tbody>
                              <tr
                                className="bg-secondary"
                                style={{
                                  color: 'black',
                                }}
                              >
                                <th
                                  className="px-2 text-dark"
                                  style={{ fontWeight: '400' }}
                                >
                                  Amount
                                </th>
                                <th
                                  className="px-2 text-dark"
                                  style={{ fontWeight: '400' }}
                                >
                                  Price
                                </th>
                              </tr>
                              {orders
                                .sort((a, b) => {
                                  return a.time > b.time
                                })
                                .map((order, index) => (
                                  <tr
                                    key={index}
                                    className={`${
                                      order.side === 'BUY'
                                        ? 'bg-light-success'
                                        : 'bg-light-danger'
                                    }`}
                                    style={{
                                      color: 'white',
                                    }}
                                  >
                                    <td className="px-2">
                                      {order.executedQty}
                                    </td>
                                    <td className="px-2">{`${
                                      order.averageFillPrice
                                    } ${market.split('-')?.[1]}`}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        )
                      }}
                    >
                      <Info size={18} style={{ marginTop: '-3px' }} />
                    </Popover>
                  </div>
                  <div className="px-0 col-12 col-lg-3 position-static">
                    <span className="d-lg-none h6">Current Price: </span>
                    <span id="value">{currentPrice}</span>
                  </div>
                  <div className="px-0 col-12 col-lg-3 position-static">
                    <span className="d-lg-none h6">Amount: </span>
                    <span id="value">{units}</span>
                  </div>
                  <div className="px-0 text-sm col-12 col-lg-3 position-static text-muted">
                    <span className="d-lg-none h6">Opened: </span>
                    <span
                      className="mr-2 text-xs badge badge-xs badge-light"
                      id="value"
                    >
                      {' '}
                      {new Date(date.replace(/\s/g, 'T')).toLocaleDateString(
                        'en-US',
                        {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      )}
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
