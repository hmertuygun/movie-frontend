import React from 'react'
import { Link } from 'react-router-dom'
import { Logo, Button } from '../'
import styles from './Header.module.css'

const Header = () => {
  return (
    <header className={styles.Header}>
      <div className={styles['Header-Logo']}>
        <Logo></Logo>
      </div>

      <div className={styles['Header-Nav']}>
        <Navigation />
      </div>

      <div className={styles['Header-Notification']}>
        <Notifications />
      </div>
    </header>
  )
}

export default Header

const Navigation = () => {
  const links = [
    { to: '/trade', text: 'Trade' },
    { to: '/positions', text: 'Positions' },
  ]

  return (
    <nav>
      {links.map((link) => (
        <Link to={link.to}>{link.text}</Link>
      ))}
    </nav>
  )
}

const Notifications = () => <Button>Notifications Bell</Button>
