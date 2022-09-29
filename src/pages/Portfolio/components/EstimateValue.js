import React, { useCallback, useEffect, useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CashoMeter from './CashoMeter'
import './EstimateValue.css'
import { currencySymbols, options } from 'constants/EstimateValues'
import { storage } from 'services/storages'
import { useSelector } from 'react-redux'

const EstimateValue = () => {
  const { estimate, lastMessage } = useSelector((state) => state.portfolio)
  const [estData, setEstData] = useState([])
  const [currentCurrency, setCurrentCurrency] = useState('USDT')
  const [showOptions, setShowOptions] = useState(false)
  const [BTC, setBTC] = useState()
  const [currency, setCurrency] = useState()
  const closeDropDownRef = useRef()

  const fetchLatestPrice = useCallback(() => {
    let tempBalance = []
    estimate.forEach((item) => {
      const data = { symbol: item?.symbol, value: item?.value }
      tempBalance.push(data)
    })
    setEstData(() => [...tempBalance])
    let btc = tempBalance && tempBalance.find((data) => data.symbol === 'BTC')
    setBTC(btc)
    let currencyValues =
      tempBalance && tempBalance.find((data) => data.symbol === currentCurrency)
    setCurrency(currencyValues)
  }, [estimate, lastMessage, currentCurrency])

  const handleClickOutside = (e) => {
    if (closeDropDownRef.current) {
      if (!closeDropDownRef.current.contains(e.target)) {
        setShowOptions(false)
      }
    }
  }

  const handleCurrencyChange = (value) => {
    setShowOptions(false)
    setCurrentCurrency(value)
    storage.set('selectedCurrency', value)
  }

  useEffect(() => {
    if (!estimate?.length) return
    fetchLatestPrice()
  }, [estimate, lastMessage, currentCurrency])

  useEffect(() => {
    let value = storage.get('selectedCurrency')
    if (value) {
      setCurrentCurrency(value)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <div className="card d-flex px-4 value-container">
        <div className="estimated-value-container">
          <div className="card-header estimate-value-header">
            <div className="d-flex align-items-center">
              <span className="h6">Selected Exchanges Approximate Value</span>
            </div>
          </div>
          <div className="card-body estimated-value">
            {BTC && (
              <div className="d-flex align-items-center mb-2">
                <div>
                  <span className="icon icon-shape icon-lg text-primary text-sm">
                    <FontAwesomeIcon icon={['fab', 'bitcoin']} />
                  </span>
                </div>
                <div className="pl-3">
                  <span className="text-muted text-sm font-weight-bold">
                    {BTC.value.toFixed(7)}{' '}
                    <span className="text-primary">{BTC.symbol}</span>
                  </span>
                </div>
              </div>
            )}
            {currency && (
              <div className="d-flex align-items-center mb-2">
                <div>
                  <span className="icon icon-shape icon-lg text-white text-sm icon-wrapper">
                    <FontAwesomeIcon
                      icon={['fas', currencySymbols[currency.symbol]]}
                    />
                    <FontAwesomeIcon
                      icon={['fas', 'chevron-down']}
                      onClick={() => setShowOptions(true)}
                    />
                    {showOptions && (
                      <div className="custom-dropdown" ref={closeDropDownRef}>
                        {options.map((option) => (
                          <p
                            onClick={() => handleCurrencyChange(option.value)}
                            ref={closeDropDownRef}
                          >
                            {option.label}
                          </p>
                        ))}
                      </div>
                    )}
                  </span>
                </div>
                <div className="pl-3">
                  <span className="text-muted text-sm font-weight-bold pl-1">
                    {currency.value}{' '}
                    <span className="text-primary">{currency.symbol}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="cashometer-container">
          <div className="card-header">
            <div className="d-flex align-items-center">
              <span className="h6">Cashometer</span>
            </div>
          </div>
          <div className="card-body estimated-value">
            <CashoMeter />
          </div>
        </div>
      </div>
    </>
  )
}

export default EstimateValue
