import React from 'react'
import './Logo.css'

const Logo = ({ withText = true, ...props }) => {
  return (
    <div className="logo">
      <img
        alt="Part one logo"
        src="../img/svg/icons/panel.svg"
        className="colorlogo"
      />
      <img
        alt="Part two logo"
        src="../../assets/img/svg/icons/panel.svg"
        className="whitelogo"
      />
      CoinPanel
    </div>
  )
}

export default Logo
