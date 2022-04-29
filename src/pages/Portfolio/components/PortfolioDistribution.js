import React, { useState } from 'react'
import { storage } from 'services/storages'
import PieCharts from './Chart/PieCharts'
import './PortfolioDistribution.css'

const PortfolioDistribution = () => {
  const [isHideBalance, setIsHideBalance] = useState(
    storage.get('hide_balance_under_ten', true) || false
  )

  return (
    <>
      <div className="card card-fluid">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="h6">Portfolio Distribution</span>
            </div>
            <div className="custom-control custom-checkbox d-flex align-items-center">
              <input
                type="checkbox"
                className="custom-control-input"
                id="check-terms"
                checked={isHideBalance}
                onChange={() => {
                  storage.set('hide_balance_under_ten', !isHideBalance)
                  setIsHideBalance(!isHideBalance)
                }}
              />
              <label
                className="custom-control-label customControlLabel"
                htmlFor="check-terms"
              >
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
