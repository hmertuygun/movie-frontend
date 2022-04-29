import httpClient from 'services/http'

const BASE_URL = process.env.REACT_APP_API_V2

const validateUser = async () => {
  const apiUrl = `${BASE_URL}register`
  return await httpClient(apiUrl, 'GET')
}

const deleteUserAccount = async () => {
  const apiUrl = `${process.env.REACT_APP_API_V2}delete`
  return await httpClient(apiUrl, 'DELETE')
}

export { validateUser, deleteUserAccount }
