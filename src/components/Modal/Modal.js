import React, { Fragment } from 'react'
import styles from './Modal.module.css'

const Modal = ({ onClose, children }) => {
  return (
    <Fragment>
      <div className={styles['Modal']}>
        <div className={styles['Modal-Content']}>{children}</div>
      </div>
      <div className={styles['Modal-Backdrop']} onClick={onClose}></div>
    </Fragment>
  )
}

export default Modal
