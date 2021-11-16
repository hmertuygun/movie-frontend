import React, { useEffect } from 'react'
import OrderNotificationCard from './OrderNotificationCard'
import OrderChannelCard from './OrderChannelCard'
import { useQuery } from 'react-query'
import {
  loadNotificationChannels,
  setTelegramNotification,
  setEmailNotification,
} from '../../api/api'
import {
  errorNotification,
  successNotification,
} from '../../components/Notifications'

const Notifications = () => {
  const notificationChannelsQuery = useQuery(
    'notification_channels',
    loadNotificationChannels,
    { retry: false }
  )

  useEffect(() => {
    if (notificationChannelsQuery.error) {
      errorNotification.open({
        description:
          'Cannot fetch notification settings. Please try again later!',
      })
    }
  }, [notificationChannelsQuery.error])

  let notificationChannels = null
  if (notificationChannelsQuery.data) {
    notificationChannels = notificationChannelsQuery.data
  } else {
    notificationChannels = false
  }

  const toggleTelegramNotification = async (enable) => {
    try {
      const { data } = await setTelegramNotification(enable)
      if (data?.status === 'error') {
        errorNotification.open({
          description:
            data?.error ||
            `Telegram notification setting couldn't be saved. Please try again later`,
        })
      } else {
        successNotification.open({
          description: `Telegram notification setting saved!`,
        })
      }
    } catch (error) {
      errorNotification.open({
        description: 'Please click Telegram settings to setup the bot first!',
      })
    } finally {
      notificationChannelsQuery.refetch()
    }
  }

  const toggleEmailNotification = async (enable) => {
    try {
      const { data } = await setEmailNotification(enable)
      if (data?.status === 'error') {
        errorNotification.open({
          description:
            data?.error ||
            `Email notification setting couldn't be saved. Please try again later`,
        })
      } else {
        successNotification.open({
          description: `Email notification setting saved!`,
        })
      }
    } catch (error) {
      errorNotification.open({
        description:
          "Email notification setting couldn't be saved. Please try again later",
      })
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
