import { exchanges } from 'ccxt'
import React, { useState } from 'react'
import { X } from 'react-feather'
import { exchangeCreationOptions } from '../../../Settings/Exchanges/ExchangeOptions'

import { useSymbolContext } from '../../context/SymbolContext'
import './style.css'

const WatchListItem = ({ symbol, removeWatchList }) => {
  const { setSymbol, templateDrawingsOpen } = useSymbolContext()
  const [showRemoveBtn, setShowRemoveBtn] = useState(false)

  const getLogo = () => {
    const exchange = symbol.value.split(':')[0].toLowerCase()
    const obj = exchangeCreationOptions.find((sy) => sy.value == exchange)
    return obj.logo
  }

  return (
    <div
      className={'watch-container'}
      onClick={() => setSymbol(symbol)}
      onMouseOver={() => setShowRemoveBtn(true)}
      onMouseLeave={() => setShowRemoveBtn(false)}
    >
      {showRemoveBtn && !templateDrawingsOpen && (
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
      <div className="label-column">
        <span className="exchange-svg">
          <img
            style={{ width: '18px', marginRight: '4px', marginTop: '-2px' }}
            src={getLogo()}
          ></img>
        </span>
        {symbol.label}
      </div>
      <div>{symbol.lastPrice}</div>
      <div className={Math.sign(symbol.percentage) > 0 ? 'plus' : 'minus'}>
        {symbol.percentage ? `${Number(symbol.percentage).toFixed(2)}%` : ''}
      </div>
    </div>
  )
}

export default WatchListItem
