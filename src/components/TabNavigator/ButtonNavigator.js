import React, { useState, Fragment, useEffect } from 'react'
import Button from '../Button/Button'
import './ButtonNavigator.css'

const ButtonNavigator = ({
  index = 0,
  children,
  labelArray = ['Target', 'Stop-loss'],
}) => {
  const [viewIndex, setViewIndex] = useState(index)

  useEffect(() => {
    setViewIndex(index)
  }, [index])

  return (
    <Fragment>
      <nav className="ButtonNavigator-container">
        <Button
          variant={viewIndex === 0 ? 'buy' : 'trade-nav'}
          onClick={() => setViewIndex(0)}
        >
          {labelArray[0]}
        </Button>

        <Button
          variant={viewIndex === 1 ? 'sell' : 'trade-nav'}
          onClick={() => setViewIndex(1)}
        >
          {labelArray[1]}
        </Button>
      </nav>

      {children[viewIndex]}
    </Fragment>
  )
}

export default ButtonNavigator
