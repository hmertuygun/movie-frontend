import React, { useState } from 'react'
import { X } from 'react-feather'

import { useSymbolContext } from 'contexts/SymbolContext'
import '../css/WatchListItem.css'
import { Permitted, Tooltip } from 'components'
import { useSelector } from 'react-redux'
import { EXCHANGES } from 'constants/Exchanges'

const WatchListItem = ({ symbol, removeWatchList, group }) => {
  const { setSymbol } = useSymbolContext()
  const { templateDrawingsOpen } = useSelector((state) => state.templates)
  const { emojis } = useSelector((state) => state.emojis)
  const { isPaidUser } = useSelector((state) => state.subscriptions)
  const { isAnalyst } = useSelector((state) => state.users)

  const [showRemoveBtn, setShowRemoveBtn] = useState(false)

  const getLogo = () => {
    const exchange = symbol.value.split(':')[0].toLowerCase()
    const obj = EXCHANGES[exchange]
    return obj && obj.logo
  }

  const getEmoji = (value) => {
    const emoji = emojis && emojis.find((emoji) => emoji.id === value)
    return emoji && emoji.emoji
  }

  const getText = (value) => {
    const text = emojis && emojis.find((emoji) => emoji.id === value)
    return text && text.text
  }

  return (
    <div
      className={'watch-container'}
      onClick={() => {
        if (window.screen.width <= 1000) {
          const divElement = document.getElementById('market-chart-container')
          divElement.scrollIntoView({ behavior: 'smooth' })
        }
        setSymbol(symbol)
      }}
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
        {((!group && templateDrawingsOpen) || (!group && isAnalyst)) &&
        isPaidUser ? (
          <Permitted feature="watchlist-flags">
            {symbol.flag ? <Tooltip id={symbol.value} place="right" /> : null}
            <span
              style={symbol.flag ? { marginRight: 7 } : { marginRight: 20 }}
              // data-toggle="tooltip"
              // data-placement="right"
              // title={getText(symbol.flag)}
              data-for={symbol.value}
              data-tip={getText(symbol.flag)}
            >
              {symbol.flag ? <span>{getEmoji(symbol.flag)}</span> : null}
            </span>
          </Permitted>
        ) : null}

        <span className="exchange-svg">
          <img
            style={{ width: '18px', marginRight: '4px', marginTop: '-2px' }}
            src={getLogo()}
            alt={symbol.label.replace('/', '-')}
          ></img>
        </span>
        {symbol.label.replace('/', '-')}
      </div>
      <div>{symbol.last}</div>
      <div className={Math.sign(symbol.percentage) > 0 ? 'plus' : 'minus'}>
        {symbol.percentage ? `${Number(symbol.percentage).toFixed(2)}%` : ''}
      </div>
    </div>
  )
}

export default WatchListItem
