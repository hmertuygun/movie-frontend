import React, { useState } from 'react'
import uniqid from 'uniqid'
import { convertCommaNumberToDot } from '../../helpers/tradeForm'
import styles from './InlineInput.module.css'

const InlineInput = ({
  label,
  type = 'number',
  placeholder,
  disabled,
  postLabel,
  onChange,
  onBlur,
  value,
  small,
  name,
  ...props
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
        onBlur={onBlur}
        onChange={onChange}
        disabled={disabled}
        id={inputId}
        placeholder={placeholder}
        type={type}
        value={value}
        name={name}
        {...props}
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
