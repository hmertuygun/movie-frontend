import React, { useState } from 'react'
import uniqid from 'uniqid'
import styles from './Input.module.css'

const Input = ({
  label,
  type = 'text',
  placeholder,
  icon,
  inlineLabel,
  disabled,
  onChange,
  value,
  postLabel,
  trade,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [isType, setType] = useState(type)
  const inputId = uniqid()

  const toggleTypeText = () => {
    if (isType === 'text') {
      setType('password')
    } else {
      setType('text')
    }
  }

  let InputContainerStyle = () => {
    if (isFocused) {
      return styles['InputContainer--isFocused']
    }

    if (disabled) {
      return styles['InputContainer--disabled']
    }

    return styles['InputContainer']
  }

  return (
    <div className={styles['Input-wrapper']}>
      <label className={styles['Input-label']} htmlFor={inputId}>
        {label}
      </label>

      {type === 'password' && (
        <span
          className={`${styles['Input-showHide']} ${styles['Input-label']}`}
          onClick={() => toggleTypeText()}
        >
          Show/hide password
        </span>
      )}

      <div className={InputContainerStyle()}>
        {icon && <span className={styles['Input-Icon']}>{icon}</span>}
        <input
          id={inputId}
          className={styles['Input-Element']}
          name={`${type}${label}`}
          type={isType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

export default Input
