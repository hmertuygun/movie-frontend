import React, { useState } from 'react'
import styles from './AddEmojiModal.module.css'
import Picker from 'emoji-picker-react'
import { PlusCircle, Edit2, Trash2 } from 'react-feather'
import { useSymbolContext } from '../context/SymbolContext'

const AddEmojiModal = ({
  onClose,
  isLoading,
  onSave,
  setIsEmojiDeleted,
  isEmojiDeleted,
}) => {
  const [showEmojis, setShowEmojis] = useState(null)
  const { emojis, setEmojis } = useSymbolContext()

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
    setEmojis(updatedEmojis)
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
    setEmojis(updatedEmojis)
    setIsEmojiDeleted([...isEmojiDeleted, value])
  }

  const handleCancel = () => {
    let emoji = JSON.parse(localStorage.getItem('flags'))
    onClose()
    setEmojis(emoji)
  }

  return (
    <div className="modal-open">
      <div
        className="modal fade show"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-modal="true"
        style={{ display: 'block' }}
      >
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
                    <div
                      className={styles.configureEmojiWrapper}
                      key={emoji.id}
                    >
                      <span
                        className={
                          emoji.emoji ? styles.emojiItem : styles.emojiItemEmpty
                        }
                      >
                        {emoji.emoji ? emoji.emoji : 'NA'}
                      </span>
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
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  )
}

export default AddEmojiModal
