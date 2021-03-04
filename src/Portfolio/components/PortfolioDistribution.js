import React, { useState } from 'react'
import PieCharts from './Chart/PieCharts'

const PortfolioDistribution = () => {
  const [isHideBalance, setIsHideBalance] = useState(false)
  return (
    <>
      <div className="card card-fluid">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="h6">Portfolio Distribution</span>
            </div>
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
                id="check-terms"
                checked={isHideBalance}
                onChange={() => {
                  setIsHideBalance(!isHideBalance)
                }}
              />
              <label className="custom-control-label" htmlFor="check-terms">
                Hide balances &lt; $10
              </label>
            </div>
          </div>
        </div>
        <div className="card-body px-5">
          <div className="row align-items-center">
            <PieCharts isHideBalance={isHideBalance} />
          </div>
        </div>
      </div>
    </>
  )
}

export default PortfolioDistribution
