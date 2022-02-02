import React, { useContext } from 'react'
import { AlertTriangle } from 'react-feather'
import './style.css'
import { useHistory } from 'react-router-dom'
import { UserContext } from '../../contexts/UserContext'

const WarningAlert = () => {
  const history = useHistory()
  const { isLoggedIn, state, subscriptionData } = useContext(UserContext)

  const handleNavigate = () => {
    history.push('/settings#subscription')
  }

  let subscriptionStatus = subscriptionData?.subscription?.status

  if (isLoggedIn && state.has2FADetails && subscriptionStatus === 'trialing') {
    return (
      <div className="alert alert-danger custom-alert px-4 m-3" role="alert">
        <AlertTriangle size={30} strokeWidth={3} />
        You are currently on a free-trial. Upgrade your account to access to
        exclusive premium features and live support with a new subscription.{' '}
        <span onClick={handleNavigate}>Click Here</span>.
      </div>
    )
  }
  return null
}

export default WarningAlert
