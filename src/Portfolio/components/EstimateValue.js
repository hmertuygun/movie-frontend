import React, { useContext, useEffect } from 'react'

import { PortfolioContext } from '../context/PortfolioContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const EstimateValue = () => {
  const { estimate, marketData } = useContext(PortfolioContext)

  useEffect(() => {
    if (!marketData?.length) return
    fetchLatestPrice()
  }, [marketData])

  // useEffect(() => {
  //   latestPricePolling()
  // }, [activeExchange])

  const fetchLatestPrice = () => {
    if (!estData?.length) return
    let tempArr = estData
    const BTC = tempArr[0].value
    const mapData = tempArr.map((item) => {
      const fData = marketData.find((item1) => item1.symbol === `BTC/${item.symbol.toUpperCase()}`)
      if (fData) {
        return { symbol: item.symbol, value: (fData.close * BTC).toFixed(2) }
      }
      else {
        return { symbol: item?.symbol, value: item?.value }
      }
    })
    setEstData(() => [...mapData])
  }

  // const latestPricePolling = () => {
  //   clearInterval(pricePolling)
  //   pricePolling = null
  //   pricePolling = setInterval(() => {
  //     fetchLatestPrice()
  //   }, 5000)
  // }

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
