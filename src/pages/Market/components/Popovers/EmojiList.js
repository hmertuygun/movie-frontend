import { Popover } from 'react-tiny-popover'
import { Flag, Edit } from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { storage } from 'services/storages'
import {
  saveWatchList,
  updateSelectEmojiPopoverOpen as setIsOpen,
} from 'store/actions'
import { consoleLogger } from 'utils/logger'
import { notify } from 'reapop'
import MESSAGES from 'constants/Messages'

const EmojiList = ({ styles, setAddEmojiModalOpen }) => {
  const { emojis, selectEmojiPopoverOpen: isOpen } = useSelector(
    (state) => state.analysts
  )
  const { activeExchange } = useSelector((state) => state.exchanges)
  const { activeWatchList, symbolsList } = useSelector(
    (state) => state.watchlist
  )
  const dispatch = useDispatch()

  const handleEmojiAssigning = async (value) => {
    try {
      const selectedSymbol = storage.get('selectedSymbol').toUpperCase()
      const selectedExchange = storage.get('selectedExchange').toUpperCase()
      const list = symbolsList
        .map((item) => ({
          label: item.label,
          value: item.value,
          flag: item.flag ? item.flag : 0,
        }))
        .map((item) => {
          if (item.value === `${selectedExchange}:${selectedSymbol}`) {
            return {
              ...item,
              flag: value,
            }
          }
          return item
        })
      const { watchListName } = activeWatchList
      let data = {
        lists: {
          [watchListName]: {
            watchListName: watchListName,
            [activeExchange.exchange]: list,
          },
        },
      }
      await dispatch(saveWatchList(data))
    } catch (error) {
      consoleLogger(error)
      dispatch(notify(MESSAGES['emoji-failed'], 'error'))
    }
  }

  return (
    <Popover
      key="watchlist-emoji-popover"
      isOpen={isOpen}
      positions={['bottom', 'top', 'right', 'left']}
      align="center"
      padding={10}
      reposition={false}
      onClickOutside={() => dispatch(setIsOpen(false))}
      content={({ position, nudgedLeft, nudgedTop }) => (
        <div className={styles.emojiPopover}>
          <div className={styles.emojiContainer}>
            <div className={styles.emojiWrapper}>
              {emojis &&
                emojis.map((emoji) => (
                  <div key={emoji.id}>
                    {emoji.emoji && (
                      <span
                        className={styles.selectedEmojiWrapper}
                        onClick={() => handleEmojiAssigning(emoji.id)}
                      >
                        {emoji.emoji}
                      </span>
                    )}
                  </div>
                ))}
            </div>
            <span className={styles.settingsWrapper}>
              <Edit onClick={() => setAddEmojiModalOpen(true)} />
            </span>
          </div>
        </div>
      )}
    >
      <div
        className={`${styles.watchListPlus} ${styles.watchListControl} ${
          isOpen ? styles.watchListControlSelected : ''
        }`}
        onClick={() => {
          dispatch(setIsOpen(true))
        }}
      >
        <Flag />
      </div>
    </Popover>
  )
}

EmojiList.propTypes = {
  styles: PropTypes.object,
  setAddEmojiModalOpen: PropTypes.func,
}

export default EmojiList
