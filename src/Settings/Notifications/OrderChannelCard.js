import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../contexts/UserContext'

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
  const { tour2CurrentStep } = useContext(UserContext)

  useEffect(() => {
    if (tour2CurrentStep === 4 && isModalVisible) {
      document.getElementById('cp-tour-2-close').click()
    } else if (tour2CurrentStep === 5) {
      document.getElementById('cp-tour-2-5').click()
    } else if (tour2CurrentStep === 6) {
      document.getElementById('cp-tour-2-close').click()
    }
  }, [tour2CurrentStep])

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
                id="cp-tour-2-5"
                className="text-sm btn btn-link"
                onClick={() => setIsModalVisible(true)}
              >
                Telegram Settings
              </button>
            )}
            <div className="custom-control custom-switch"  id={channel === 'Email' ? 'cp-tour-2-7' : ''}>
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
