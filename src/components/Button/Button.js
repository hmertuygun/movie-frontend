import React from 'react'
import './Button.css'

const Button = ({ children, primary, type = '', size = 'normal', ...props }) => {
  return (
    <button
      className={[
        'Button',
        primary ? 'Button-primary' : null,
        'Button-' + size,
      ].join(' ')}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
