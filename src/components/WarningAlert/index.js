import React, { useContext } from 'react'
import { AlertTriangle } from 'react-feather'
import './style.css'
import { useHistory } from 'react-router-dom'
import { UserContext } from 'contexts/UserContext'

const WarningAlert = () => {
  const history = useHistory()
  const {
    isLoggedIn,
    isCountryAvailable,
    state,
    totalExchanges,
    activeExchange,
  } = useContext(UserContext)

  const handleNavigate = () => {
    history.push('/settings#subscription')
  }

  const handleZendesk = () => {
    window.zE(function () {
      window.zE.activate()
    })
  }

  const currentExchange = totalExchanges.find(
    (exchange) => exchange.apiKeyName === activeExchange?.apiKeyName
  )

  return (
    <>
      {isLoggedIn && currentExchange?.error ? (
        <div className="alert alert-danger custom-alert px-4" role="alert">
          <AlertTriangle size={30} strokeWidth={3} />
          There is an error with your API key. It can be either expired or
          restricted. Please check it in your exchange account or contact
          support if you need <span onClick={handleZendesk}>help</span>.
        </div>
      ) : null}
      {isLoggedIn && state.has2FADetails && !isCountryAvailable ? (
        <div className="alert alert-danger custom-alert px-4" role="alert">
          <AlertTriangle size={30} strokeWidth={3} />
          <strong>Attention CoinPaneler!</strong> For regulatory purposes we
          must ask you to register your country of residency. To register your
          country, please <span onClick={handleNavigate}>Click Here</span>.
        </div>
      ) : null}
    </>
  )
}

export default WarningAlert
