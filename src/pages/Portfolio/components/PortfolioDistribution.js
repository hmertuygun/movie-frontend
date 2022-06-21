import { PortfolioContext } from 'contexts/PortfolioContext'
import React, { useContext } from 'react'
import SunburstChart from './Chart/SunburstChart'
import './PortfolioDistribution.css'

const PortfolioDistribution = () => {
  const { chart } = useContext(PortfolioContext)

  return (
    <>
      <div className="card card-fluid">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="h6">Portfolio Distribution</span>
            </div>
          </div>
        </div>
        <div className="card-body">
          {chart && chart.children && (
            <div className="row align-items-center d-flex align-items-center justify-content-center">
              <SunburstChart data={chart} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default PortfolioDistribution
