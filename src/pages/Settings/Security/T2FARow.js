import React from 'react'
import { Trash2 } from 'react-feather'
import { formatDate } from 'utils/formatDate'
import PropTypes from 'prop-types'

const RemoveButton = ({ onClick }) => {
  return (
    <button className="action-item mr-2" onClick={onClick}>
      <Trash2
        strokeWidth="2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        size={15}
      />
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
          <RemoveButton onClick={onRemove} />
        </div>
      </div>
    </div>
  </li>
)

T2FARow.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  date: PropTypes.instanceOf(Date),
  onRemove: PropTypes.func,
}

export default T2FARow
