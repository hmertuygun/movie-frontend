import React from 'react'
import { Link } from 'react-router-dom'
// eslint-disable-next-line css-modules/no-unused-class
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
  remove,
  pageLink,
  outline,
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

    if (remove) {
      return styles[`Button-remove`]
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

  if (pageLink) {
    return (
      <button className="page-link" {...props}>
        {children}
      </button>
    )
  }

  return (
    <button
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
