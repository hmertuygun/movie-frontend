import React, { useContext, useEffect, useState, useRef } from 'react'
import { PortfolioContext } from '../context/PortfolioContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSymbolContext } from '../../Trade/context/SymbolContext'
import CashoMeter from './CashoMeter'
import './EstimateValue.css'

const EstimateValue = () => {
  const { estimate, marketData } = useContext(PortfolioContext)
  const [estData, setEstData] = useState([])
  const { lastMessage } = useSymbolContext()
  const [currentCurrency, setCurrentCurrency] = useState('USDT')
  const [showOptions, setShowOptions] = useState(false)
  const closeDropDownRef = useRef();

  useEffect(() => {
    setEstData(estimate)
  }, [estimate])

  // useEffect(() => {
  //   if (!marketData?.length) return
  //   fetchLatestPrice()
  // }, [marketData])

  const currencySymbols = {
    USDT: 'dollar-sign',
    EUR: 'euro-sign',
    GBP: 'pound-sign',
    AUD: 'dollar-sign'
  }

  const options = [
    { value: 'USDT', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
  ]

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [])

  useEffect(() => {
    if (!estData?.length || !lastMessage?.length) return
    fetchLatestPrice()
  }, [lastMessage])

  useEffect(() => {
    let value = localStorage.getItem('selectedCurrency')
    if(value) {
      setCurrentCurrency(value)
    }
  },[])

  const handleClickOutside = e => {
    if(closeDropDownRef.current) {
      if (!closeDropDownRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    }
  };

  const handleCurrencyChange = (value) => {
    setShowOptions(false)
    setCurrentCurrency(value)
    localStorage.setItem('selectedCurrency', value)
  }

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

  let BTC = estData && estData.find(data => data.symbol === "BTC");
  let currency = estData && estData.find(data => data.symbol === currentCurrency);
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
            {BTC && 
              <div className="d-flex align-items-center mb-2">
                <div>
                  <span className="icon icon-shape icon-sm bg-soft-info text-primary text-sm">
                      <FontAwesomeIcon icon={['fab', 'bitcoin']} />
                  </span>
                </div>
                <div className="pl-2">
                  <span className="text-muted text-sm font-weight-bold">
                    {BTC.value} {BTC.symbol}
                  </span>
                </div>
              </div>
            }     
            {currency && 
              <div className="d-flex align-items-center mb-2">
                <div>
                  <span className="icon icon-shape icon-sm bg-soft-info text-primary text-sm icon-wrapper">
                      <FontAwesomeIcon icon={['fas', currencySymbols[currency.symbol]]} />
                      <FontAwesomeIcon icon={['fas', 'chevron-down']} onClick={() => setShowOptions(true)}/>
                      {showOptions &&
                        <div className="custom-dropdown" ref={closeDropDownRef}>
                          {options.map(option => <p onClick={() => handleCurrencyChange(option.value)} ref={closeDropDownRef}>{option.label}</p>)}
                        </div>
                      } 
                  </span>
                </div>
                <div className="pl-2">
                  <span className="text-muted text-sm font-weight-bold">
                    {currency.value} {currency.symbol}
                  </span>
                </div>
              </div>
            }
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
