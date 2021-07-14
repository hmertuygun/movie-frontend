import React, { useState } from 'react'
import { X } from 'react-feather'

import { useSymbolContext } from '../../context/SymbolContext'
import './style.css'

const WatchListItem = ({ symbol, removeWatchList }) => {
  const { setSymbol } = useSymbolContext()
  const [showRemoveBtn, setShowRemoveBtn] = useState(false)

  return (
    <div
      className={'watch-container'}
      onClick={() => setSymbol(symbol)}
      onMouseOver={() => setShowRemoveBtn(true)}
      onMouseLeave={() => setShowRemoveBtn(false)}
    >
      {showRemoveBtn && (
        <div
          className={'removeBtn'}
          onClick={(e) => {
            e.stopPropagation()
            removeWatchList(symbol)
          }}
        >
          <X size={20} />
        </div>
      )}
      <div>{symbol.label}</div>
      <div>{symbol.lastPrice}</div>
      <div className={Math.sign(symbol.percentage) > 0 ? 'plus' : 'minus'}>
        {symbol.percentage ? `${Number(symbol.percentage).toFixed(2)}%` : ''}
      </div>
    </div>
  )
}

export default WatchListItem
