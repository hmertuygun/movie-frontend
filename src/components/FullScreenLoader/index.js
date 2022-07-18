import React, { useEffect } from 'react'
import './index.css'
import { useSelector } from 'react-redux'

const FullScreenLoader = () => {
  const { loaderText, loaderVisible } = useSelector((state) => state.appFlow)
  useEffect(() => {
    if (loaderVisible) {
      document.body.style.overflowY = 'hidden'
      document.body.style.maxHeight = '100vh'
    } else {
      document.body.style.overflowY = 'unset'
      document.body.style.maxHeight = 'unset'
    }
  }, [loaderVisible])

  return (
    <div
      className={`full-screen-loader`}
      style={{ display: loaderVisible ? 'flex' : 'none' }}
    >
      <div className="loader-content">
        <span className="spinner-border text-primary"></span>
        <p>{loaderText}</p>
      </div>
    </div>
  )
}

export default FullScreenLoader
