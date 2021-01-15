import React from 'react'
import { useLocation } from 'react-router-dom'
import QuickFinal from '../Auth/QuickFinal'
import NewPassword from '../Auth/NewPassword'

// https://reactrouter.com/web/example/query-parameters
function useQuery() {
  return new URLSearchParams(useLocation().search)
}

const HandleEmailActions = () => {
  const query = useQuery()

  const actionCode = query.get('oobCode')
  const mode = query.get('mode')

  // Handle the user management action.
  switch (mode) {
    case 'resetPassword':
      // Display reset password handler and UI.
      return <NewPassword actionCode={actionCode} />

    case 'recoverEmail':
      // Display email recovery handler and UI.
      console.error('We do not have that yet.')
      // handleRecoverEmail(auth, actionCode, lang)
      break
    case 'verifyEmail':
      // Display email verification handler and UI.
      return <QuickFinal actionCode={actionCode} />

    default:
    // Error: invalid mode.
  }

  return <div></div>
}

export default HandleEmailActions
