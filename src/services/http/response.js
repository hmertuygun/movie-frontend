import signToken from './signToken'

export function handleResponse(response, needSign) {
  if (needSign) {
    return signToken(response.headers['x-header'], response)
  }
  return response
}

export function handleError(error) {
  return error
}
