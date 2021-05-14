import React, { useEffect, useState } from 'react'
import { X } from 'react-feather'

import { useSymbolContext } from '../../context/SymbolContext'
import styles from './style.module.css'

const WatchListItem = ({ symbol, removeWatchList }) => {
  const { setSymbol, lastMessage } = useSymbolContext()
  const [percentage, setPercentage] = useState(null)
  const [showRemoveBtn, setShowRemoveBtn] = useState(false)

  useEffect(() => {
    const activeMarketData = lastMessage.find((data) => {
      return data.symbol.replace('/', '') === symbol.label.replace('-', '')
    })
    if (activeMarketData?.priceChangePercent) {
      setPercentage(activeMarketData?.priceChangePercent)
    }
  }, [lastMessage, symbol])

  return (
    <div
      className={styles.container}
      onClick={() => setSymbol(symbol)}
      onMouseOver={() => setShowRemoveBtn(true)}
      onMouseLeave={() => setShowRemoveBtn(false)}
    >
      {showRemoveBtn && (
        <div
          className={styles.removeBtn}
          onClick={(e) => {
            e.stopPropagation()
            removeWatchList(symbol)
          }}
        >
          <X size={20} />
        </div>
      )}
      <div>{symbol.label}</div>
      <div className={Math.sign(percentage) > 0 ? styles.plus : styles.minus}>
        {percentage ? `${percentage}%` : ''}
      </div>
    </div>
  )
}

export default WatchListItem
