import React from 'react'
import { useQuery } from 'react-query'
import { connectTelegramLoadKey, disconnectTelegram } from '../../api/api'
import {
  errorNotification,
  successNotification,
} from '../../components/Notifications'

const QuickModal = ({ onClose, connected }) => {
  const connectTelegramLoadKeyQuery = useQuery(
    'connectTelegramLoadKey',
    connectTelegramLoadKey
  )

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
        errorNotification.open({
          description:
            data?.error ||
            `Couldn't be disconnect Telegram. Please try again later`,
        })
      } else {
        successNotification.open({
          description: `Successfully disconnected!`,
        })
      }
    } catch (error) {
      errorNotification.open({
        description: `Couldn't be disconnect Telegram. Please try again later`,
      })
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
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Telegram Bot Settings
              </h5>
              <p className="mb-0">
                Write "/start" to <a href="https://t.me/coinpanelbot" target="_blank">@coinpanelbot</a> on Telegram to set up your Telegram notifications.
              </p>
              <button
                onClick={onClose}
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                {telegramKey && (
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text" id="basic-addon1">
                        Telegram Key
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

export default QuickModal
