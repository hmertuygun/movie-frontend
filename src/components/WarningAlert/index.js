import React, { useContext } from 'react'
import { AlertTriangle } from 'react-feather'
import './style.css'
import { useHistory } from 'react-router-dom'
import { UserContext } from '../../contexts/UserContext'

const WarningAlert = () => {
  const history = useHistory()
  const { isLoggedIn, isCountryAvailable } = useContext(UserContext)
  const handleNavigate = () => {
    history.push('/settings#subscription')
  }

  if (isLoggedIn && !isCountryAvailable) {
    return (
      <div className="alert alert-danger custom-alert px-4" role="alert">
        <AlertTriangle size={30} strokeWidth={3} />
        <strong>Attention CoinPaneler!</strong> For regulatory purposes we must
        ask you to register your country of residency. To register your country,
        please <span onClick={handleNavigate}>Click Here</span>.
      </div>
    )
  }
  return null
}

export default WarningAlert
