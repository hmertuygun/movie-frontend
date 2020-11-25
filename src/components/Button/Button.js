import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Button.module.css'

const Button = ({
  children,
  primary,
  plain,
  type = 'button',
  to = false,
  size = false,
  variant, // 'buy', 'sell'
  className,
  disabled,
  ...props
}) => {
  const ButtonStyle = () => {
    if (plain) {
      return styles['Button-plain']
    }

    if (primary) {
      return styles['Button-primary']
    }

    if (variant) {
      return styles[`Button-${variant}`]
    }

    if (size) {
      return styles[`Button-${size}`]
    }

    return styles['Button']
  }

  if (to) {
    return (
      <Link className={ButtonStyle()} type="button" to={to} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button
      primary={primary}
      className={ButtonStyle()}
      type={type}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
