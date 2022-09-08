import React from 'react'
import { notify } from 'reapop'
import { useQuery } from 'react-query'
import { connectTelegramLoadKey, disconnectTelegram } from 'services/api'
import { useCopyToClipboard } from 'hooks'
import MESSAGES from 'constants/Messages'
import { useDispatch } from 'react-redux'

const TelegramSettingModal = ({ onClose, connected }) => {
  const connectTelegramLoadKeyQuery = useQuery(
    'connectTelegramLoadKey',
    connectTelegramLoadKey
  )
  const [isCopied, handleCopy] = useCopyToClipboard()
  const dispatch = useDispatch()
  let telegramKey = null
  if (connectTelegramLoadKeyQuery.data) {
    telegramKey = connectTelegramLoadKeyQuery.data.telegramKey
  } else {
    telegramKey = false
  }

  const disconnect = async () => {
    try {
      const { data } = await disconnectTelegram()
      if (data?.status === 'error') {
        dispatch(notify(MESSAGES['telegram-disconnect-failed'], 'error'))
      } else {
        dispatch(notify(MESSAGES['telegram-disconnected'], 'success'))
      }
    } catch (error) {
      dispatch(notify(MESSAGES['telegram-disconnect-failed'], 'error'))
    }
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
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content" id="cp-tour-2-6">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Telegram Bot Settings
              </h5>
              <button
                id="cp-tour-2-close"
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
              <div className="form-group">
                <p>
                  Write "/start" to{' '}
                  <a
                    href="https://t.me/coinpanelbot"
                    target="_blank"
                    rel="noreferrer"
                  >
                    @coinpanelbot
                  </a>{' '}
                  on Telegram to set up your Telegram notifications.
                </p>
                {telegramKey && (
                  <div className="form-group">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon1">
                          Key
                        </span>
                      </div>
                      <input
                        type="text"
                        disabled
                        className="form-control"
                        name="apiKey"
                        value={telegramKey && telegramKey}
                        aria-label="apikey"
                        aria-describedby="basic-addon1"
                      />
                    </div>
                    <button
                      className="btn btn-primary float-right mt-2"
                      onClick={() => handleCopy(telegramKey)}
                    >
                      {isCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                disabled={!connected}
                type="submit"
                className="btn btn-primary"
                onClick={() => disconnect()}
              >
                Disconnect Telegram Bot
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  )
}

export default TelegramSettingModal