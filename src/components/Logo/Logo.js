import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ThemeContext } from 'contexts/ThemeContext'
import ColoredLogo from 'assets/images/logo/colored.svg'
import WhiteLogo from 'assets/images/logo/white.svg'
import './Logo.css'

const Logo = () => {
  const { theme } = useContext(ThemeContext)
  const style = {
    color: theme === 'DARK' ? 'white' : 'var(--blue)',
  }

  return (
    <Link to="/" className="logo" style={style}>
      <img alt="CoinPanel" src={ColoredLogo} className="colorlogo" />
      <img alt="CoinPanel" src={WhiteLogo} className="whitelogo" />
    </Link>
  )
}

export default Logo
