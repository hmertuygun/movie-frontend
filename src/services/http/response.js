import signToken from './signToken'
import store from 'store'
import { updateShow2FAModal } from 'store/actions'

export function handleResponse(response, needSign) {
  if (needSign) {
    return signToken(response.headers['x-header'], response)
  }
  return response
}

export function handleError(error) {
  const { response } = error
  if (response.status === 403 && response.data.detail === 'Token is invalid!') {
    store.dispatch(updateShow2FAModal(true))
  }
  return error
}
