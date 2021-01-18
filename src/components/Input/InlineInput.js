import React, { useState } from 'react'
import uniqid from 'uniqid'
import styles from './InlineInput.module.css'

const InlineInput = ({
  label,
  type = 'number',
  placeholder,
  disabled,
  postLabel,
  onChange,
  value,
  small,
  name,
}) => {
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
        /*         onChange={(event) => {
          onChange(event.target)
        }} */
        onChange={(event) => {
          onChange(event)
        }}
        disabled={disabled}
        id={inputId}
        placeholder={placeholder}
        type={type}
        value={value}
        name={name}
      ></input>
      <span
        className={small ? styles.InputPostLabelSmall : styles.InputPostLabel}
      >
        {postLabel}
      </span>
    </div>
  )
}

export default InlineInput
