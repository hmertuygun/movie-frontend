import httpClient from 'services/http'

const BASE_URL = process.env.REACT_APP_API
const GOOGLE_AUTH = `${BASE_URL}googleauth`

const checkGoogleAuth2FA = async () => {
  const apiUrl = GOOGLE_AUTH
  return await httpClient(apiUrl, 'GET')
}

const createGoogleAuth2FA = async () => {
  const apiUrl = `${GOOGLE_AUTH}/add`
  return await httpClient(apiUrl, 'POST', {})
}

const saveGoogleAuth2FA = async ({
  auth_answer,
  key,
  title,
  description,
  date,
  type,
}) => {
  const apiUrl = `${GOOGLE_AUTH}/save`
  const data = {
    auth_answer,
    key,
    title,
    description,
    date,
    type,
  }
  return await httpClient(apiUrl, 'POST', data)
}

const verifyGoogleAuth2FA = async (auth_answer) => {
  const apiUrl = `${GOOGLE_AUTH}/verify`
  const data = {
    auth_answer,
  }
  return httpClient(apiUrl, 'POST', data, true)
}

const deleteGoogleAuth2FA = async (auth_answer) => {
  const apiUrl = GOOGLE_AUTH
  const data = {
    auth_answer,
  }
  return await httpClient(apiUrl, 'DELETE', data)
}

export {
  checkGoogleAuth2FA,
  createGoogleAuth2FA,
  saveGoogleAuth2FA,
  verifyGoogleAuth2FA,
  deleteGoogleAuth2FA,
}
