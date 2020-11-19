import React, { useState } from 'react'
import uniqid from 'uniqid'
import styles from './InlineInput.module.css'

const InlineInput = ({
  label,
  type = 'number',
  placeholder,
  disabled,
  postLabel,
  trade,
}) => {
  const [value, setValue] = useState()
  const [isFocused, setIsFocused] = useState(false)
  const inputId = uniqid()

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
    <div className={InputContainerStyle()}>
      <label className={styles.InputLabel} htmlFor={inputId}>
        {label}
      </label>
      <input
        className={styles.InputElement}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        id={inputId}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      ></input>
      <span className={styles.InputPostLabel}>{postLabel}</span>
    </div>
  )
}

export default InlineInput
