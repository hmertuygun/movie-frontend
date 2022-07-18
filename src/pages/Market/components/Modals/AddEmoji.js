import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { PlusCircle, Edit2, Trash2 } from 'react-feather'
import Picker from 'emoji-picker-react'
import { Modal } from 'components'
import { storage } from 'services/storages'
import styles from '../../css/AddEmoji.module.css'
import { updateEmojis } from 'store/actions'

const AddEmoji = ({
  onClose,
  isLoading,
  onSave,
  setIsEmojiDeleted,
  isEmojiDeleted,
}) => {
  const [showEmojis, setShowEmojis] = useState(null)
  const { emojis } = useSelector((state) => state.emojis)
  const dispatch = useDispatch()

  const handleEmojiClick = (e, data, id) => {
    setShowEmojis(null)
    const updatedEmojis =
      emojis &&
      emojis.map((emoji) => {
        if (id === emoji.id) {
          return {
            ...emoji,
            emoji: data.emoji,
          }
        }
        return emoji
      })
    dispatch(updateEmojis(updatedEmojis))
  }

  const handleTextChange = (e, id) => {
    const updatedEmojis =
      emojis &&
      emojis.map((emoji) => {
        if (id === emoji.id) {
          return {
            ...emoji,
            text: e.target.value,
          }
        }
        return emoji
      })
    dispatch(updateEmojis(updatedEmojis))
  }

  const handleDeleteEmoji = async (value) => {
    const updatedEmojis = await emojis.map((emoji) => {
      if (value === emoji.id) {
        return {
          ...emoji,
          emoji: '',
        }
      }
      return emoji
    })
    dispatch(updateEmojis(updatedEmojis))
    setIsEmojiDeleted([...isEmojiDeleted, value])
  }

  const handleCancel = () => {
    let emoji = storage.get('flags', true)
    onClose()
    dispatch(updateEmojis(emoji))
  }

  return (
    <Modal>
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-title">Configure Emoji's</div>
            <button
              onClick={onClose}
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span className="modal-cross" aria-hidden="true">
                &times;
              </span>
            </button>
          </div>
          <div className="modal-body">
            <div>
              {emojis &&
                emojis.map((emoji) => (
                  <div className={styles.configureEmojiWrapper} key={emoji.id}>
                    <span
                      className={
                        emoji.emoji ? styles.emojiItem : styles.emojiItemEmpty
                      }
                    >
                      {emoji.emoji ? emoji.emoji : 'NA'}
                    </span>
                    {emoji.emoji && (
                      <input
                        type="text"
                        className="form-control"
                        style={{
                          width: 140,
                          padding: 5,
                          minHeight: 40,
                          height: 40,
                        }}
                        value={emoji.text}
                        onChange={(e) => handleTextChange(e, emoji.id)}
                        placeholder="Tooltip"
                        aria-label="Tooltip"
                        aria-describedby="Tooltip"
                      />
                    )}
                    <div>
                      {emoji.emoji ? (
                        <Edit2 onClick={() => setShowEmojis(emoji.id)} />
                      ) : (
                        <PlusCircle onClick={() => setShowEmojis(emoji.id)} />
                      )}
                      {emoji.emoji && (
                        <Trash2
                          onClick={() => handleDeleteEmoji(emoji.id)}
                          style={{ marginLeft: 10 }}
                        />
                      )}
                    </div>

                    {showEmojis === emoji.id && (
                      <Picker
                        pickerStyle={{ position: 'absolute', zIndex: 999 }}
                        onEmojiClick={(e, data) =>
                          handleEmojiClick(e, data, emoji.id)
                        }
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>
          <div className="modal-footer">
            <button
              disabled={isLoading}
              onClick={onSave}
              className="btn btn-primary"
            >
              {!isLoading ? (
                'Save'
              ) : (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default AddEmoji
