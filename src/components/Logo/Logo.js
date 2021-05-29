import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ThemeContext } from '../../contexts/ThemeContext'; 
import './Logo.css'

const Logo = () => {
  const { theme } = useContext(ThemeContext);
  const style = {
    color: theme === "DARK" ? "white": "var(--blue)"
  }

  return (
    <Link to="/" className="logo" style={style}>
      <img
        alt="Part one logo"
        src="/img/svg/icons/Coinpanel_Color.svg"
        className="colorlogo"
      />
      <img
        alt="Part one logo"
        src="/img/svg/icons/Coinpanel_White.svg"
        className="whitelogo"
      />
      CoinPanel
    </Link>
  )
}

export default Logo
