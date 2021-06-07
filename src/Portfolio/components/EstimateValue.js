import React, { useContext, useEffect, useState } from 'react'
import { PortfolioContext } from '../context/PortfolioContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSymbolContext } from '../../Trade/context/SymbolContext'
import CashoMeter from './CashoMeter'
import './EstimateValue.css'

const EstimateValue = () => {
  const { estimate, marketData } = useContext(PortfolioContext)
  const [estData, setEstData] = useState([])
  const { lastMessage } = useSymbolContext()

  useEffect(() => {
    setEstData(estimate)
  }, [estimate])

  // useEffect(() => {
  //   if (!marketData?.length) return
  //   fetchLatestPrice()
  // }, [marketData])

  useEffect(() => {
    if (!estData?.length || !lastMessage?.length) return
    fetchLatestPrice()
  }, [lastMessage])

  const fetchLatestPrice = () => {
    let tempBalance = []
    const BTC = estData[0].value
    estData.forEach((item) => {
      const fData = lastMessage.find(
        (item1) => item1.symbol === `BTC${item.symbol.toUpperCase()}`
      )
      const data = fData
        ? { symbol: item.symbol, value: (fData.lastPrice * BTC).toFixed(2) }
        : { symbol: item?.symbol, value: item?.value }
      tempBalance.push(data)
    })
    setEstData(() => [...tempBalance])
  }
  return (
    <>
      <div className="card card-fluid d-flex flex-row">
        <div className="card-content-left">
          <div className="card-header">
            <div className="d-flex align-items-center">
              <span className="h6">Estimated Value</span>
            </div>
          </div>
          <div className="card-body">
            {estData &&
              estData.map((item, idx) => {
                return (
                  <div className="d-flex align-items-center mb-2" key={idx}>
                    <div>
                      <span className="icon icon-shape icon-sm bg-soft-info text-primary text-sm">
                        {item.symbol === 'BTC' ? (
                          <FontAwesomeIcon icon={['fab', 'bitcoin']} />
                        ) : item.symbol === 'USDT' ? (
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
        <div className="card-content-right">
          <div className="card-header">
            <div className="d-flex align-items-center">
              <span className="h6">Cashometer</span>
            </div>
          </div>
          <div className="card-body">
            <CashoMeter />
          </div>
        </div>
      </div>
    </>
  )
}

export default EstimateValue
