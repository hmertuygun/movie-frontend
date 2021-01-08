import React from 'react'
import PieCharts from './Chart/PieCharts'

const PortfolioDistribution = () => {
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
        <div className="card-body px-5">
          <div className="row align-items-center">
            <PieCharts />
          </div>
        </div>
      </div>
    </>
  )
}

export default PortfolioDistribution
