import React, { Fragment, useRef } from 'react'
// eslint-disable-next-line css-modules/no-unused-class
import styles from './Modal.module.css'

const Modal = ({ onClose, children }) => {
  const modalRef = useRef()
  return (
    <Fragment>
      <div
        ref={modalRef}
        className={styles['Modal']}
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            onClose && onClose()
          }
        }}
      >
        <div>{children}</div>
      </div>
      <div className={styles['Modal-Backdrop']}></div>
    </Fragment>
  )
}

export default Modal
