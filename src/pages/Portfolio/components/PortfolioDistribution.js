import React from 'react'
import { useSelector } from 'react-redux'
import SunburstChart from './Chart/SunburstChart'
import './PortfolioDistribution.css'

const PortfolioDistribution = () => {
  const { sunburstChart } = useSelector((state) => state.charts)
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
          {sunburstChart && sunburstChart.children && (
            <div className="row align-items-center d-flex align-items-center justify-content-center">
              <SunburstChart data={sunburstChart} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default PortfolioDistribution
