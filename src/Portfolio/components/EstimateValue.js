import React, { useContext, useEffect } from 'react'

import { PortfolioContext } from '../context/PortfolioContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const EstimateValue = () => {
  const { estimate, marketData } = useContext(PortfolioContext)

  useEffect(() => {
    if (!marketData?.length || !estimate) return
  }, [estimate, marketData])

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
          {estimate &&
            estimate.map((item, idx) => {
              if (item.symbol === 'USDT') {
                item.symbol = 'USD'
              }
              return (
                <div className="d-flex align-items-center mb-2" key={idx}>
                  <div>
                    <span className="icon icon-shape icon-sm bg-soft-info text-primary text-sm">
                      {item.symbol === 'BTC' ? (
                        <FontAwesomeIcon icon={['fab', 'bitcoin']} />
                      ) : item.symbol === 'USD' ? (
                        <FontAwesomeIcon icon={['fas', 'dollar-sign']} />
                      ) : item.symbol === 'EUR' ? (
                        <FontAwesomeIcon icon={['fas', 'euro-sign']} />
                      ) : item.symbol === 'GBP' ? (
                        <FontAwesomeIcon icon={['fas', 'pound-sign']} />
                      ) : (
                        item.symbol
                      )}
                    </span>
                  </div>

                  <div className="pl-2">
                    <span className="text-muted text-sm font-weight-bold">
                      {item.value} {item.symbol}
                    </span>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </>
  )
}

export default EstimateValue
