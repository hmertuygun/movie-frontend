import React from 'react'

const OrderNotificationCard = ({
  title,
  description,
  showImportantlabel = false,
  checkboxId,
}) => (
  <div className="list-group-item d-flex w-100 justify-content-between">
    <div>
      <h6 className="font-weight-light mb-3">
        {title}
        {showImportantlabel && (
          <span className="badge badge-soft-warning ml-3">Important</span>
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
        />
        <label className="custom-control-label" for={checkboxId}></label>
      </div>
    </div>
  </div>
)

export default OrderNotificationCard
