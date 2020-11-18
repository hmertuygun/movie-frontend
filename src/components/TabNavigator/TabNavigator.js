import React, { useState, Fragment } from 'react'
import './TabNavigator.css'

const TabNavigator = ({ index, labelArray = [], children }) => {
  const [contentIndex, setContentIndex] = useState(index | 0)

  return (
    <Fragment>
      <div className="TabNavigator-container">
        <nav className="TabNavigator-nav">
          {labelArray.map((label, labelIndex) => (
            <div
              className={[
                'TabNavigator-link',
                contentIndex === labelIndex
                  ? 'TabNavigator-link--active'
                  : null,
              ].join(' ')}
              key={`${labelIndex}-key`}
              onClick={() => setContentIndex(labelIndex)}
            >
              {label}
            </div>
          ))}
        </nav>
      </div>

      <Fragment>{children[contentIndex]}</Fragment>
    </Fragment>
  )
}

export default TabNavigator
