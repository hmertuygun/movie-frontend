import React from 'react'
import { Link } from 'react-router-dom'
import './Logo.css'

const Logo = () => (
  <Link to="/" className="logo">
    <img
      alt="Part one logo"
      src="/img/svg/icons/panel.svg"
      className="colorlogo"
    />
    <img
      alt="Part two logo"
      src="/assets/img/svg/icons/panel.svg"
      className="whitelogo"
    />
    CoinPanel
  </Link>
)

export default Logo
