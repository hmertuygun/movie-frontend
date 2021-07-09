import React from 'react'
import uniqid from 'uniqid'
// eslint-disable-next-line css-modules/no-unused-class
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
  const inputId = uniqid()

  let InputContainerStyle = () => {
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
        autoComplete="off"
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
