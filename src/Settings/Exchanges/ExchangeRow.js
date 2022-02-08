import React, { Fragment, useContext } from 'react'
import { ThemeContext } from '../../contexts/ThemeContext'
import './ExchangeRow.css'

const ExchangeRow = ({ row, onDeleteClick, isLast, onUpdateClick }) => {
  const { theme } = useContext(ThemeContext)

  return (
    <Fragment>
      <div className="row align-items-center">
        <div className="col-md-4">
          <h6 className="text-sm mb-0" style={{ textTransform: 'capitalize' }}>
            {row.exchange} - {row.apiKeyName}
          </h6>
        </div>

        <div className="col-md-4 text-center exchange-logo">
          <img
            width={
              row.exchange === 'binance'
                ? '100'
                : row.exchange === 'bybit'
                ? '65'
                : row.exchange === 'huobipro'
                ? '90'
                : '120'
            }
            src={`img/svg/exchange/${
              theme === 'LIGHT' ? row.exchange : `${row.exchange}-white`
            }.svg`}
            alt={row.exchange}
          />
        </div>

        <div className="col-md-4 text-right">
          <span
            className={`text-sm text-primary mr-4`}
            style={{ cursor: 'pointer' }}
            onClick={onUpdateClick}
          >
            Update
          </span>
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
