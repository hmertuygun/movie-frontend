import React from 'react'

const Logo = ({ withText = true, ...props }) => {
  return (
    <div
      style={{
        color: 'blue',
        width: '360px',
      }}
    >
      <h1 style={{ color: 'blue' }}>CP {withText && <span>CoinPanel</span>}</h1>
    </div>
  )
}

export default Logo
