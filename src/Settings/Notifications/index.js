import React from 'react'
import OrderNotificationCard from './OrderNotificationCard'
import OrderChannelCard from './OrderChannelCard'

const Notifications = () => {
  return (
    <div className="slice slice-sm bg-section-secondary">
      <div className="justify-content-center">
        <div className="row">
          <div className="col-lg-12">
            <h5 className="mb-3">Order Notifications</h5>
            <div className="card">
              <div className="list-group list-group-flush">
                <OrderNotificationCard
                  title="Order triggered"
                  showImportantlabel={true}
                  description="You will receive an alert when the specified price is reached and an
                order is placed or failed."
                  checkboxId="shop-notification-1"
                />
                <OrderNotificationCard
                  title="Trailing stop order moves"
                  description="You will receive an alert when your trailing stop order's
                  price is updated."
                  checkboxId="shop-notification-2"
                />
                <OrderNotificationCard
                  title="Stop-loss / take-profit adjustments"
                  description="You will receive an alert when your SL/TP triggers and
                  orders are adjusted."
                  checkboxId="shop-notification-3"
                />
              </div>
            </div>

            <div className="row justify-content-center">
              <div className="col-lg-12">
                <div>
                  <div className="row align-items-center mb-3">
                    <div className="col">
                      <h5 className="mb-0">Notification Channels</h5>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-xl-12">
                    <div className="card card-fluid">
                      <div className="card-body">
                        <OrderChannelCard
                          channel="Desktop"
                          channelId="card-notification-41"
                          icon="fas fa-desktop"
                        />
                        <hr className="my-3" />
                        <OrderChannelCard
                          channel="Telegram"
                          channelId="card-notification-42"
                          icon="fab fa-telegram"
                        />
                        <hr className="my-3" />
                        <OrderChannelCard
                          channel="Mobile App"
                          channelId="card-notification-43"
                          icon="fas fa-mobile"
                        />
                        <hr className="my-3" />
                        <OrderChannelCard
                          channel="Email"
                          channelId="card-notification-44"
                          icon="fas fa-envelope"
                        />
                        <hr className="my-3" />
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
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications
