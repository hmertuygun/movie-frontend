import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../../contexts/UserContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
const SubscriptionModal = () => {
  const { hasSub, isLoggedIn, showSubModalIfLessThan7Days, trialDaysLeft, setShowSubModal } = useContext(UserContext)

  const modalVisibility = () => {
    if (isLoggedIn) {
      if (!hasSub || showSubModalIfLessThan7Days) return 'block'
      else return 'none'
    }
    else {
      return 'none'
    }
  }

  const modalStyle = {
    background: 'rgba(0,0,0,.5)',
    display: modalVisibility()
  }

  return (
    <div className={`modal fade docs-example-modal-lg pt-5 show`} style={modalStyle}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title h6">{showSubModalIfLessThan7Days ? 'Trial ending reminder' : 'Renew Subscription'}</h5>
          </div>
          <div className="modal-body">
            <div className="d-flex align-items-center flex-column">
              <FontAwesomeIcon icon="exclamation-triangle" size="6x" color="#f25767" className="mb-3" />
              <p>
                {showSubModalIfLessThan7Days ? `You have less than ${Math.ceil(trialDaysLeft)} days left. ` : 'Uh oh! Looks like your CoinPanel subscription has expired. '}
                Click on the button below to renew your subscription.
              </p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowSubModal(false)}>
                <Link to="/settings#subscription" className="text-light">Buy Subscription</Link>
                <FontAwesomeIcon icon="external-link-alt" color="#ffffff" className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>)
}

export default SubscriptionModal