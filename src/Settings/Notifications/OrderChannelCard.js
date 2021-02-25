import React from 'react'

const OrderChannelCard = ({ channel, channelId, icon }) => (
  <div className="row align-items-center">
    <div className="col">
      <h6 className="text-sm mb-0">
        <i className={`${icon} fa-fw mr-2`} />
        {channel}
      </h6>
    </div>
    <div className="col-auto">
      <div className="custom-control custom-switch">
        <input
          type="checkbox"
          className="custom-control-input"
          id={channelId}
          // checked=""
        />
        <label className="custom-control-label" for={channelId}></label>
      </div>
    </div>
  </div>
)

export default OrderChannelCard
