import React, { useState } from 'react'

import TelegramSettingModal from './TelegramSettingModal'

const OrderChannelCard = ({
  channel,
  channelId,
  icon,
  enabled,
  toggleChannelSetting,
  showTelegramSetting,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)

  return (
    <>
      {isModalVisible && (
        <TelegramSettingModal
          onClose={() => setIsModalVisible(false)}
          connected={enabled}
        />
      )}
      <div className="row align-items-center">
        <div className="col">
          <h6 className="mb-0 text-sm">
            <i className={`${icon} fa-fw mr-2`} />
            {channel}
          </h6>
        </div>
        <div className="col-auto">
          <div className="d-flex align-items-center">
            {showTelegramSetting && (
              <button
                className="text-sm btn btn-link"
                onClick={() => setIsModalVisible(true)}
              >
                Telegram Settings
              </button>
            )}
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id={channelId}
                checked={enabled}
                onChange={() => toggleChannelSetting(!enabled)}
              />
              <label
                className="custom-control-label"
                htmlFor={channelId}
              ></label>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderChannelCard
