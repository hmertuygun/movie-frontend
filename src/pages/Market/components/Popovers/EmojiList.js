import { Popover } from 'react-tiny-popover'
import { Flag, Edit } from 'react-feather'
import { useDispatch } from 'react-redux'

const EmojiList = ({
  styles,
  isOpen,
  setEmojiListOpen,
  emojis,
  handleEmojiAssigning,
  setAddEmojiModalOpen,
}) => {
  const dispatch = useDispatch()
  return (
    <Popover
      key="watchlist-emoji-popover"
      isOpen={isOpen}
      positions={['bottom', 'top', 'right', 'left']}
      align="center"
      padding={10}
      reposition={false}
      onClickOutside={() => dispatch(setEmojiListOpen(false))}
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
          dispatch(setEmojiListOpen(true))
        }}
      >
        <Flag />
      </div>
    </Popover>
  )
}

export default EmojiList
