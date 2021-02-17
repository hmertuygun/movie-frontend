import React, { Fragment } from 'react'

const ExchangeRow = ({ row, onDeleteClick, isLast }) => {
  // const isActive = () => {
  //   let getSavedKey = sessionStorage.getItem('exchangeKey')
  //   if (!getSavedKey) return false
  //   getSavedKey = JSON.parse(getSavedKey)
  //   return getSavedKey.exchange === row.exchange && getSavedKey.apiKeyName === row.apiKeyName
  // }
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
          <a
            href="#"
            className={`text-sm text-danger`}
            onClick={onDeleteClick}
          >
            Delete
          </a>
        </div>
      </div>

      {!isLast && <hr className="my-3" />}
    </Fragment>
  )
}

export default ExchangeRow
