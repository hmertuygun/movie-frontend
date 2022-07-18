import React, { useEffect, useState } from 'react'

import TelegramSettingModal from './TelegramSettingModal'
import { useSelector } from 'react-redux'

const OrderChannelCard = ({
  channel,
  channelId,
  icon,
  enabled,
  toggleChannelSetting,
  showTelegramSetting,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { tour2CurrentStep } = useSelector((state) => state.appFlow)

  useEffect(() => {
    if (tour2CurrentStep === 4 && isModalVisible) {
      document.getElementById('cp-tour-2-close').click()
    } else if (tour2CurrentStep === 5) {
      document.getElementById('cp-tour-2-5').click()
    } else if (tour2CurrentStep === 6) {
      document.getElementById('cp-tour-2-close').click()
    }
  }, [isModalVisible, tour2CurrentStep])

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
            {showTelegramSetting ? (
              <button
                className="btn btn-link p-0"
                onClick={() => setIsModalVisible(true)}
              >
                Telegram Settings
              </button>
            ) : (
              <span>{channel}</span>
            )}
          </h6>
        </div>
        <div className="col-auto">
          <div className="d-flex align-items-center">
            <div
              className="custom-control custom-switch"
              id={channel === 'Email' ? 'cp-tour-2-7' : ''}
            >
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
