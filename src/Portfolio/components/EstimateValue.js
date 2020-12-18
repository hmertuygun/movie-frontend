import React, { useState } from 'react'

const EstimateValue = () => {
  const [tickers] = useState([])

  const EstimatedValues = tickers.map((value, idx) => {
    return <ul key={idx}> {value.price}</ul>
  })

  return (
    <>
      <div className="card card-fluid">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="h6">Estimated Value</span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="d-flex align-items-center mb-2">
            <div>
              <span className="icon icon-shape icon-sm bg-soft-info text-primary">
                <i className="fab fa-bitcoin"></i>
              </span>
            </div>

            <div className="pl-2">
              <span className="text-muted text-sm font-weight-bold">
                {EstimatedValues ? EstimatedValues : 'not data available'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default EstimateValue
