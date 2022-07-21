export function handleResponse(response) {
  return response
}

export function handleError(error) {
  if (error.response) return error.response
  return error
}
