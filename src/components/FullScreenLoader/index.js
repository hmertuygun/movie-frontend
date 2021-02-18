import React, { useState, useContext, useEffect } from 'react'
import { UserContext } from '../../contexts/UserContext'
import "./index.css"

const FullScreenLoader = ({ show }) => {
  const { loaderText, showLoader } = useContext(UserContext)
  return (
    <div className={`full-screen-loader`} style={{ display: show ? 'flex' : 'none' }}>
      <div className="loader-content">
        <span className="spinner-border text-primary"></span>
        <p>{loaderText}</p>
      </div>
    </div>
  )
}

export default FullScreenLoader