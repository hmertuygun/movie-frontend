import React, { useState, Fragment, useContext, useEffect } from 'react'
import { UserContext } from '../../contexts/UserContext'
import Button from '../Button/Button'
import './ButtonNavigator.css'

const ButtonNavigator = ({
  index = 0,
  children,
  labelArray = ['Target', 'Stop-loss'],
}) => {
  const [viewIndex, setViewIndex] = useState(index)
  const { isTourStep5, isTourFinished} = useContext(UserContext);

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
      <nav className="ButtonNavigator-container" id={labelArray[0] === 'BUY' ? 'cp-tour5' : ''}>
        <Button
          variant={viewIndex === 0 ? 'buy' : 'trade-nav'}
          onClick={() => setViewIndex(0)}
          id={labelArray[0] === 'BUY' ? 'buy-btn' : ''}
        >
          {labelArray[0]}
        </Button>

        <Button
          variant={viewIndex === 1 ? 'sell' : 'trade-nav'}
          onClick={() => setViewIndex(1)}
          id={labelArray[1] === 'SELL' ? 'sell-btn' : ''}
        >
          {labelArray[1]}
        </Button>
      </nav>

      {children[viewIndex]}
    </Fragment>
  )
}

export default ButtonNavigator
