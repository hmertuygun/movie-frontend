import React from 'react'
import ReactTooltip from 'react-tooltip'
import styles from './index.module.css'

const Tooltip = (props) => {
  return (
    <ReactTooltip
      effect="solid"
      className={styles.appTooltip}
      arrowColor="#1f2d3d"
      {...props}
    />
  )
}

export default Tooltip
