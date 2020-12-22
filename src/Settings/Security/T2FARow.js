import React from 'react'
import { formatDate } from './utils'

const RemoveRow = ({ onRemove }) => {
  return (
    <button className="action-item mr-2" onClick={onRemove}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="feather feather-trash-2"
      >
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    </button>
  )
}

const T2FARow = ({ title, description, date, onRemove }) => (
  <li className="list-group-item">
    <div className="row align-items-center">
      <div className="col-auto">
        <img
          alt="Google Auth APP Icon"
          src="img/svg/misc/google-auth.svg"
          className="img-fluid"
          style={{ width: '40px' }}
        />
      </div>
      <div className="col ml-n2">
        <h6 className="text-sm mb-0">{title}</h6>
        <p className="card-text small text-muted">{description}</p>
      </div>
      <div className="col-md d-none d-md-block">
        <span className="text-muted">Added:</span> {formatDate(date)}
      </div>
      <div className="col-auto">
        <div className="actions text-right ml-3">
          <RemoveRow onRemove={onRemove} />
        </div>
      </div>
    </div>
  </li>
)

export default T2FARow
