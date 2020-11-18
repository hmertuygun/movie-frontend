import React, { useState, Fragment } from 'react'
import Button from '../Button/Button'
import './ButtonNavigator.css'

const ButtonNavigator = ({ children, startIndex = 0 }) => {
  const [viewIndex, setViewIndex] = useState(startIndex)

  return (
    <Fragment>
      <nav className="ButtonNavigator-container">
        <Button
          variant={viewIndex === 0 ? 'buy' : null}
          onClick={() => setViewIndex(0)}
        >
          Buy
        </Button>

        <Button
          variant={viewIndex === 1 ? 'sell' : null}
          onClick={() => setViewIndex(1)}
        >
          Sell
        </Button>
      </nav>

      {children[viewIndex]}
    </Fragment>
  )
}

export default ButtonNavigator
