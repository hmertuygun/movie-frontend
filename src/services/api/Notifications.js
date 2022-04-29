import httpClient from 'services/http'
import createQueryString from 'utils/createQueryString'

const BASE_URL = process.env.REACT_APP_API

const loadNotificationChannels = async () => {
  const apiUrl = `${BASE_URL}loadNotificationChannels`
  const response = await httpClient(apiUrl, 'GET')
  return response.data
}

const setTelegramNotification = async (enable) => {
  const apiUrl = `${BASE_URL}setTelegramNotification?${createQueryString({
    enable: enable,
  })}`
  return await httpClient(apiUrl, 'POST')
}

const setEmailNotification = async (enable) => {
  const apiUrl = `${BASE_URL}setEmailNotification?${createQueryString({
    enable: enable,
  })}`
  return await httpClient(apiUrl, 'POST')
}

const storeNotificationToken = async (fcmToken) => {
  const apiUrl = `${BASE_URL}notification/token?${createQueryString({
    notification_token: fcmToken,
  })}`
  const response = await httpClient(apiUrl, 'POST')
  return response.data
}

export {
  loadNotificationChannels,
  setTelegramNotification,
  setEmailNotification,
  storeNotificationToken,
}
