import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ThemeContext } from 'contexts/ThemeContext'
import '../../Logo/Logo.css'
import ColoredLogo from 'assets/images/logo/colored.svg'
import WhiteLogo from 'assets/images/logo/white.svg'

const Logo = () => {
  const { theme } = useContext(ThemeContext)

  return (
    <>
      <Link
        id="cp-tour1"
        className="navbar-brand"
        to="/trade"
        style={{
          fontSize: '1.7rem',
          fontWeight: '700',
          color: theme === 'DARK' ? 'white' : '',
        }}
      >
        <img alt="CoinPanel" src={ColoredLogo} className="colorlogo" />
        <img alt="CoinPanel" src={WhiteLogo} className="whitelogo" />
      </Link>
    </>
  )
}

export default Logo
