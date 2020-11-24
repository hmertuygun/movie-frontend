import React from 'react'

export default ({ withText = true, ...props }) => {
  return (
    <div style={{
        color: 'blue',
        width: '360px'
       }}>
      <h1 style={{ color: 'blue'}}>
        CP {withText && (<span>CoinPanel</span>)}
      </h1>
    </div>)
}