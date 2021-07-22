import React from 'react'
import './Typography.css'

const Typography = ({
  as = 'p',
  color = 'default',
  size,
  children,
  className,
}) => {
  const TextElement = React.createElement(
    as,
    {
      className: [
        'Typography',
        className,
        color && `Typography--${color}`,
        size && `Typography--${size}`,
      ].join(' '),
    },
    children
  )

  if (children) {
    return TextElement
  } else {
    return null
  }
}

export default Typography
