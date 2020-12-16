import React from 'react'
import ChartDataCtxProvider from '../context/ChartContext'
import PieCharts from './Chart/PieCharts'

const PortfolioDistribution = () => {
  return (
    <>
      <div className="card card-fluid">
        <div className="card-header">
          <div className="display: flex;  flex-direction: column">
            <div>
              <span className="h6">Portfolio Distribution</span>
            </div>
            {/*          <ChartDataCtxProvider>
                            <PieCharts />
                        </ChartDataCtxProvider> */}
            <PieCharts />
          </div>
        </div>
      </div>
    </>
  )
}

export default PortfolioDistribution
