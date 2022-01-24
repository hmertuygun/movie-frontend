import { exchanges } from 'ccxt'
import React, { useState, useContext } from 'react'
import { X } from 'react-feather'
import { exchangeCreationOptions } from '../../../constants/ExchangeOptions'
import { UserContext } from '../../../contexts/UserContext'
import { useSymbolContext } from '../../context/SymbolContext'
import './style.css'
import Tooltip from '../../../components/Tooltip'
import { TEMPLATE_DRAWINGS_USERS } from '../../../constants/TemplateDrawingsList'

const WatchListItem = ({ symbol, removeWatchList, group }) => {
  const { setSymbol, templateDrawingsOpen, emojis } = useSymbolContext()
  const { userData, isPaidUser } = useContext(UserContext)
  const [showRemoveBtn, setShowRemoveBtn] = useState(false)

  const getLogo = () => {
    const exchange = symbol.value.split(':')[0].toLowerCase()
    const obj = exchangeCreationOptions.find((sy) => sy.value == exchange)
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
        {((!group && templateDrawingsOpen) ||
          (!group && TEMPLATE_DRAWINGS_USERS.includes(userData.email))) &&
        isPaidUser ? (
          <>
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
          </>
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
