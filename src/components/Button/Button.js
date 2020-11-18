import React from 'react'
import './Button.css'

const Button = ({
  children,
  primary,
  type = '',
  size = 'normal',
  variant, // 'buy', 'sell'
  className,
  ...props
}) => {
  return (
    <button
      className={[
        'Button',
        primary ? 'Button-primary' : null,
        variant ? `Button-${variant}` : null,
        'Button-' + size,
        className,
      ].join(' ')}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
