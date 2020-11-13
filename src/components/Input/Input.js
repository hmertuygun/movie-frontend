import React, { useState } from 'react'
import './Input.css'

const Input = ({ label, type = 'text', placeholder, icon, inlineLabel, subLabel, ...props }) => {
  const [isFocused, setIsFocused] = useState(false)
  const [isType, setType] = useState(type)


  const toggleTypeText = () => {
    if (isType === 'text') {
      setType('password')
    } else {
      setType('text')
    }
  }

  return (
    <div className="Input-wrapper">
      <label className="Input-label" htmlFor={`${label}${type}`}>{label}</label>

      {type === 'password' && (<span className="Input-showHide Input-label" onClick={() => toggleTypeText()}>Show/hide password</span>)}

      <div 
        className={[
          "Input-container", 
          icon && "Input-container--has-icon",
          isFocused  && "Input-container--is-Focused" 
        ].join(' ')}
      >
        {icon && <span className="Input-Icon">{icon}</span>}
        <input
          id={`${label}${type}`}
          className="Input-Element"
          name={`${type}${label}`}
          type={isType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

export default Input
