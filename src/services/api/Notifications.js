import { API_URLS, BASE_URL } from 'constants/config'
import httpClient from 'services/http'
import createQueryString from 'utils/createQueryString'

const platformMessageUrl = API_URLS['platform-messages']
const noticeUrl = API_URLS['notice']

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

const fetchPlatformMessages = async () => {
  const apiUrl = platformMessageUrl
  return await httpClient(apiUrl, 'GET')
}

const fetchUserNotices = async () => {
  const apiUrl = `${noticeUrl}/list`
  return await httpClient(apiUrl, 'GET')
}

export {
  loadNotificationChannels,
  setTelegramNotification,
  setEmailNotification,
  storeNotificationToken,
  fetchPlatformMessages,
  fetchUserNotices,
}
