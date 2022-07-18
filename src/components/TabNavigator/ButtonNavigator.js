import React, { useState, Fragment, useEffect, useMemo } from 'react'
import Button from '../Button/Button'
import './ButtonNavigator.css'
import { useSelector } from 'react-redux'

const ButtonNavigator = ({
  index = 0,
  children,
  labelArray = ['Target', 'Stop-loss'],
  tabButtonOutline = false,
  isDisabled = false,
}) => {
  const [viewIndex, setViewIndex] = useState(index)
  const { isTourStep5, isTourFinished } = useSelector((state) => state.appFlow)
  const disabledStyle = useMemo(() => {
    return isDisabled
      ? {
          pointerEvents: 'none',
          cursor: 'not-allowed',
          opacity: '0.7',
        }
      : null
  }, [isDisabled])

  useEffect(() => {
    if (isTourStep5) {
      document.getElementById('sell-btn').click()
    }
  }, [isTourStep5])

  useEffect(() => {
    if (isTourFinished) {
      document.getElementById('buy-btn').click()
    }
  }, [isTourFinished])

  return (
    <Fragment>
      {tabButtonOutline ? (
        <nav
          className="ButtonNavigator-outline-container"
          id={labelArray[0] === 'BUY' ? 'cp-tour5' : ''}
        >
          <Button
            variant={viewIndex === 0 ? 'buy' : 'buy-outline'}
            onClick={() => setViewIndex(0)}
            id={labelArray[0] === 'BUY' ? 'buy-btn' : ''}
          >
            {labelArray[0]}
          </Button>

          <Button
            variant={viewIndex === 1 ? 'sell' : 'sell-outline'}
            onClick={() => setViewIndex(1)}
            id={labelArray[1] === 'SELL' ? 'sell-btn' : ''}
          >
            {labelArray[1]}
          </Button>
        </nav>
      ) : (
        <nav
          className="ButtonNavigator-container"
          id={labelArray[0] === 'BUY' ? 'cp-tour5' : ''}
        >
          <Button
            variant={viewIndex === 0 ? 'buy' : 'trade-nav'}
            onClick={() => setViewIndex(0)}
            id={labelArray[0] === 'BUY' ? 'buy-btn' : ''}
            style={disabledStyle}
          >
            {labelArray[0]}
          </Button>

          <Button
            variant={viewIndex === 1 ? 'sell' : 'trade-nav'}
            onClick={() => setViewIndex(1)}
            id={labelArray[1] === 'SELL' ? 'sell-btn' : ''}
            style={disabledStyle}
          >
            {labelArray[1]}
          </Button>
        </nav>
      )}

      {children[viewIndex]}
    </Fragment>
  )
}

export default ButtonNavigator
