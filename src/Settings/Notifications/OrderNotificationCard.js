import React from 'react'

const OrderNotificationCard = ({
  title,
  description,
  showImportantlabel = false,
  checkboxId,
  enabled,
}) => (
  <div className="list-group-item d-flex w-100 justify-content-between">
    <div>
      <h6 className="mb-3 font-weight-light">
        {title}
        {showImportantlabel && (
          <span className="ml-3 badge badge-soft-warning">Important</span>
        )}
      </h6>

      <span className="text-sm text-muted">{description}</span>
    </div>
    <div>
      <div className="custom-control custom-switch">
        <input
          type="checkbox"
          className="custom-control-input"
          id={checkboxId}
          disabled
          checked={enabled}
        />
        <label className="custom-control-label" htmlFor={checkboxId}></label>
      </div>
    </div>
  </div>
)

export default OrderNotificationCard
