import React, { Fragment } from 'react'

const ExchangeRow = ({ row, onDeleteClick, isLast }) => {
  return (
    <Fragment>
      <div className="row align-items-center">
        <div className="col-md-4">
          <h6 className="text-sm mb-0" style={{ textTransform: 'capitalize' }}>
            {row.exchange} - {row.apiKeyName}
          </h6>
        </div>

        <div className="col-md-4 text-center">
          <img
            src="img/svg/exchange/binance.svg"
            height="20px"
            alt="biance"
          ></img>
        </div>

        <div className="col-md-4 text-right">
          <span
            className={`text-sm text-danger`}
            style={{ cursor: 'pointer' }}
            onClick={onDeleteClick}
          >
            Delete
          </span>
        </div>
      </div>

      {!isLast && <hr className="my-3" />}
    </Fragment>
  )
}

export default ExchangeRow
