import React, { useContext, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { UserContext } from '../../contexts/UserContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
const SubscriptionModal = () => {
  const history = useHistory()
  const {
    hasSub,
    isLoggedIn,
    showSubModalIfLessThan7Days,
    trialDaysLeft,
    setShowSubModal,
    needPayment,
  } = useContext(UserContext)

  const modalVisibility = useMemo(() => {
    if (isLoggedIn) {
      if (!hasSub || (showSubModalIfLessThan7Days && needPayment))
        return 'block'
      else return 'none'
    } else {
      return 'none'
    }
  }, [hasSub, showSubModalIfLessThan7Days, needPayment])

  const modalStyle = useMemo(() => {
    return {
      background: 'rgba(0,0,0,.5)',
      display: modalVisibility,
    }
  }, [modalVisibility])

  const onBuySubClick = () => {
    setShowSubModal(false)
    history.push('/settings#subscription')
  }

  return (
    <div
      className={`modal fade docs-example-modal-lg pt-5 show`}
      style={modalStyle}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title h6">
              {showSubModalIfLessThan7Days
                ? 'Trial ending reminder'
                : 'Renew Subscription'}
            </h5>
          </div>
          <div className="modal-body">
            <div className="d-flex align-items-center flex-column">
              <FontAwesomeIcon
                icon="exclamation-triangle"
                size="6x"
                color="#f25767"
                className="mb-3"
              />
              <p className="text-center">
                {showSubModalIfLessThan7Days
                  ? `You have less than ${Math.ceil(
                      trialDaysLeft
                    )} days left. Click on the button below to add payment method to keep your subscription active. `
                  : 'Uh oh! Looks like your CoinPanel subscription has expired. Click on the button below to renew your subscription.'}
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onBuySubClick}
              >
                {showSubModalIfLessThan7Days
                  ? `Add Payment Method`
                  : 'Buy Subscription'}
                <FontAwesomeIcon
                  icon="external-link-alt"
                  color="#ffffff"
                  className="ml-1"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionModal
