import React, { Fragment, useRef } from 'react'
import styles from './Modal.module.css'

const Modal = ({ onClose, children }) => {
  const modalRef = useRef()
  return (
    <Fragment>
      <div ref={modalRef} className={styles['Modal']} onClick={(e) => {
        if (e.currentTarget === e.target) {
          onClose && onClose()
        }
      }}>
        <div className={styles['Modal-Content']}>{children}</div>
      </div>
      <div className={styles['Modal-Backdrop']}></div>
    </Fragment>
  )
}

export default Modal
