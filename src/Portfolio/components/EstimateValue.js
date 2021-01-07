import React, { useContext, useEffect } from 'react'

import { PortfolioContext } from '../context/PortfolioContext'

const EstimateValue = () => {
  const { estimate } = useContext(PortfolioContext)
  useEffect(() => {}, [estimate])

  return (
    <>
      <div className="card card-fluid">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="h6">Estimated Value</span>
              {estimate &&
                estimate.map((item, idx) => {
                  return (
                    <div className="d-flex align-items-center mb-2" key={idx}>
                      <div>
                        <span className="icon icon-shape icon-md bg-soft-info text-primary">
                          <i className="fab fa-bitcoin"></i>
                          {item.symbol}
                        </span>
                      </div>

                      <div className="pl-2">
                        <span className="text-muted text-sm font-weight-bold">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default EstimateValue
