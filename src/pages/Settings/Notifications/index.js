import React from 'react'
import { notify } from 'reapop'
import OrderNotificationCard from './OrderNotificationCard'
import OrderChannelCard from './OrderChannelCard'
import { useQuery } from 'react-query'
import {
  loadNotificationChannels,
  setTelegramNotification,
  setEmailNotification,
} from 'services/api'
import MESSAGES from 'constants/Messages'
import { useDispatch } from 'react-redux'

const Notifications = () => {
  const dispatch = useDispatch()
  const notificationChannelsQuery = useQuery(
    'notification_channels',
    loadNotificationChannels,
    {
      retry: false,
      refetchOnWindowFocus: false,
      onError: () => {
        dispatch(notify(MESSAGES['notification-settings-failed'], 'error'))
      },
    }
  )
  let notificationChannels = null
  if (notificationChannelsQuery.data) {
    notificationChannels = notificationChannelsQuery.data
  } else {
    notificationChannels = false
  }

  const toggleTelegramNotification = async (enable) => {
    try {
      const res = await setTelegramNotification(enable)
      if (res?.status === 'error') {
        dispatch(notify(MESSAGES['telegram-settings-failed'], 'error'))
      } else if (res?.status !== 200) {
        dispatch(notify(res.data.detail, 'info'))
      } else {
        dispatch(notify(MESSAGES['telegram-settings-success'], 'success'))
      }
    } catch (error) {
      dispatch(notify(MESSAGES['telegram-bot-error'], 'error'))
    } finally {
      notificationChannelsQuery.refetch()
    }
  }

  const toggleEmailNotification = async (enable) => {
    try {
      const { data } = await setEmailNotification(enable)
      if (data?.status === 'error') {
        dispatch(
          notify(data?.error || MESSAGES['email-settings-failed'], 'error')
        )
      } else {
        dispatch(notify(MESSAGES['email-settings-saved'], 'success'))
      }
    } catch (error) {
      dispatch(notify(MESSAGES['email-settings-failed'], 'error'))
    } finally {
      notificationChannelsQuery.refetch()
    }
  }

  const isDisabled =
    !notificationChannelsQuery.isLoading && notificationChannels

  return (
    <div className="slice slice-sm bg-section-secondary">
      <div className="justify-content-center">
        <div className="row justify-content-center">
          <div className="col-lg-12">
            <div>
              <div className="mb-3 row align-items-center">
                <div className="col">
                  <h5 className="mb-0">Notification Channels</h5>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-xl-12">
                <div className="card card-fluid">
                  <div className="card-body">
                    {/* <OrderChannelCard
                            channel="Desktop"
                            channelId="card-notification-41"
                            icon="fas fa-desktop"
                          />
                          <hr className="my-3" /> */}
                    <OrderChannelCard
                      channel="Telegram"
                      channelId="card-notification-42"
                      icon="fab fa-telegram"
                      showTelegramSetting
                      enabled={notificationChannels?.telegram_activated}
                      toggleChannelSetting={toggleTelegramNotification}
                    />
                    {/* <hr className="my-3" />
                          <OrderChannelCard
                            channel="Mobile App"
                            channelId="card-notification-43"
                            icon="fas fa-mobile"
                          /> */}
                    <hr className="my-3" />
                    <OrderChannelCard
                      channel="Email"
                      channelId="card-notification-44"
                      icon="fas fa-envelope"
                      enabled={notificationChannels?.email_activated}
                      toggleChannelSetting={toggleEmailNotification}
                    />
                    {/* <hr className="my-3" />
                          <OrderChannelCard
                            channel="SMS"
                            channelId="card-notification-45"
                            icon="fas fa-sms"
                          />
                          <hr className="my-3" />
                          <OrderChannelCard
                            channel="Discord"
                            channelId="card-notification-46"
                            icon="fab fa-discord"
                          /> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <h5 className="mb-3">Order Notifications</h5>
            <div className="card">
              <div className="list-group list-group-flush">
                <OrderNotificationCard
                  title="Order triggered"
                  showImportantlabel={true}
                  description="You will receive an alert when the specified price is reached and an order is placed or failed."
                  checkboxId="shop-notification-1"
                  enabled={
                    notificationChannels?.notification_types?.order_triggered
                  }
                />
                <OrderNotificationCard
                  title="Order fills"
                  description="You will receive an alert when an order is filled in Full Trade."
                  checkboxId="shop-notification-2"
                  enabled={
                    notificationChannels?.notification_types?.order_fills
                  }
                />
                <OrderNotificationCard
                  title="Stop-loss amount adjustments"
                  description="You will receive an alert when your Full Trade TP triggers and SL order amount is adjusted."
                  checkboxId="shop-notification-3"
                  enabled={
                    notificationChannels?.notification_types?.stop_loss_adj
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications
