import React, { useReducer } from 'react'
import styles from './Alert.module.css'

export const AlertRef = {
  trigger: null,
  type: {
    primary: 'primary',
    secondary: 'secondary',
    success: 'success',
    danger: 'danger',
    warning: 'warning',
    info: 'info',
    light: 'light',
    dark: 'dark',
  },
}

const ACTIONS = {
  showAlert: 'showAlert',
  hideAlert: 'hideAlert',
}

const INITIAL_STATE = { visible: false, children: null, alertType: 'primary' }
const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.showAlert:
      return {
        visible: true,
        children: action.children,
        alertType: action.alertType,
      }
    case ACTIONS.hideAlert:
      return INITIAL_STATE
    default:
      throw new Error()
  }
}

const Alert = () => {
  const [{ visible, children, alertType = 'primary' }, dispatch] = useReducer(
    reducer,
    INITIAL_STATE
  )

  AlertRef.trigger = (children, alertType) => {
    dispatch({ type: ACTIONS.showAlert, children, alertType })
  }

  if (!visible) return null
  return (
    <div
      className={`alert alert-${alertType} ${styles.topRight} alert-dismissible fade show`}
      role="alert"
    >
      {children}
      <button
        type="button"
        className="close"
        aria-label="Close"
        onClick={() => dispatch({ type: ACTIONS.hideAlert })}
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  )
}

export default Alert
