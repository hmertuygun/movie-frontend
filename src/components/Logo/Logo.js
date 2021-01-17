import React from 'react'
import { Link } from 'react-router-dom'
import './Logo.css'

const Logo = () => (
  <Link to="/" className="logo">
    <img
      alt="Part one logo"
      src="/img/svg/icons/Coinpanel_Color.svg"
      className="colorlogo"
    />
    CoinPanel
  </Link>
)

export default Logo
