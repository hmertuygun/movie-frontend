import httpClient from 'services/http'

const BASE_URL = process.env.REACT_APP_USER_ACTIONS_API

const sendLoginInfo = async () => {
  const apiUrl = `${BASE_URL}`
  const payload = { action: 'login' }

  const response = await httpClient(apiUrl, 'POST', payload)
  return response.data
}

export { sendLoginInfo }
