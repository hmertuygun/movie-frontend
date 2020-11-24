import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Button from '../Button/Button'
import './Link.css'


const Link = ({ children, to, type = 'link', ...props }) => {
  return (<RouterLink to={to}>{children}</RouterLink>)
}

export default Link