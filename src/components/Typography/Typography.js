import React from 'react'
import './Typography.css'

const Typography = ({ as = 'paragraph', color = 'default', size, children, ...props }) => {
  
  const TextElement = React.createElement(as, {
    className: [
    'Typography',
    color && `Typography--${color}`, 
    size  && `Typography--${size}`].join(' ')
  }, children)

  if(children) {
    return TextElement
  } else {
    return null
  }
}


export default Typography