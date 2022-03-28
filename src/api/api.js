import axios from 'axios'
import { firebase } from '../firebase/firebase'
import capitalize from '../helpers/capitalizeFirstLetter'

async function getHeaders(token) {
  return {
    'Content-Type': 'application/json;charset=UTF-8',
    Authorization: `Bearer ${token}`,
    'Access-Control-Allow-Methods':
      'GET, POST, PUT, PATCH, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export async function placeOrder({
  entry,
  targets,
  stoploss,
  apiKeyName,
  exchange,
}) {
  const newTargets = targets.map((target, index) => {
    const { side, type, symbol, quantity, price, triggerPrice } = target
    return {
      targetNumber: index + 1,
      percentage: (target.quantity / entry.quantity) * 100,
      quantity,
      side,
      type,
      symbol,
      trigger: triggerPrice,
      price,
    }
  })

  const newStoploss = stoploss.map((stoploss) => {
    const { side, type, symbol, quantity, triggerPrice, price } = stoploss
    return {
      side,
      type,
      symbol,
      quantity,
      trigger: triggerPrice,
      price,
      percentage: (stoploss.quantity / entry.quantity) * 100,
    }
  })

  const data = {
    entryOrder: entry,
    targets: newTargets,
    stopLoss: { ...newStoploss[0] },
    exchange: exchange,
    apiKeyName: apiKeyName,
  }

  console.log({ dataToBeSent: data })
  const apiUrl = process.env.REACT_APP_API_V2 + 'createFullTrade'
  const token = await firebase.auth().currentUser.getIdToken()
  const fullTrade = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data,
  })

  return fullTrade
}

export async function createBasicTrade(payload) {
  console.log({ dataToBeSent: payload })
  const apiUrl = process.env.REACT_APP_API_V2 + 'createBasicTrade'
  const token = await firebase.auth().currentUser.getIdToken()
  const basicTrade = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: payload,
  })

  return basicTrade
}

// make sure users can be recognized by user component
export async function validateUser() {
  const apiUrl = process.env.REACT_APP_API_V2 + 'register'
  try {
    const token = await firebase.auth().currentUser.getIdToken()

    const validated = await axios(apiUrl, {
      headers: await getHeaders(token),
    })

    return validated
  } catch (error) {
    console.error(error)
    return error
  }
}

// make sure symbol list can be pulled
export async function getExchanges() {
  const apiUrl = process.env.REACT_APP_API_V2 + 'exchange'
  const token = await firebase.auth().currentUser?.getIdToken()
  const exchanges = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })
  return exchanges.data
}

export async function getOneExchange(exchange) {
  const apiUrl = `${process.env.REACT_APP_API_V2}exchange?exchange=${exchange}`
  const token = await firebase.auth().currentUser?.getIdToken()
  const exchanges = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })
  return exchanges.data
}

export async function getBalance({ symbol, apiKeyName, exchange }) {
  const apiUrl = `${
    process.env.REACT_APP_PORTFOLIO_API
  }balance/${symbol}?api_key=${apiKeyName}&exchange=${capitalize(exchange)}`
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })
  return response
}

export async function getLastPrice(symbol, exchange) {
  symbol = symbol.replace('/', '-')
  const apiUrl = `${process.env.REACT_APP_PORTFOLIO_API}last_price?symbol=${symbol}&exchange=${exchange}`
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })
  return response
}

export async function addUserExchange(data) {
  const apiUrl = process.env.REACT_APP_API_V2 + 'addApiKey'
  const token = await firebase.auth().currentUser.getIdToken()
  const added = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data,
  }).catch((error) => {
    return error?.response
  })
  return added
}

export async function getUserExchanges() {
  try {
    const apiUrl = process.env.REACT_APP_API + 'loadApiKeys'
    const token = await firebase.auth().currentUser?.getIdToken()

    const exchanges = await axios(apiUrl, {
      headers: await getHeaders(token),
      method: 'GET',
    })
    return exchanges
  } catch (error) {}
}

export async function updateLastSelectedAPIKey({ apiKeyName, exchange }) {
  const apiUrl = `${process.env.REACT_APP_API}updateLastSelectedApiKey?apiKeyName=${apiKeyName}&exchange=${exchange}`
  const token = await firebase.auth().currentUser.getIdToken()
  const added = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
  })
  return added
}

export async function activateUserExchange(exchangeName) {
  const apiUrl = process.env.REACT_APP_API + 'activateApiKey'
  const token = await firebase.auth().currentUser.getIdToken()

  const activate = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: { apiKeyName: exchangeName },
  })

  return activate
}

export async function deleteUserExchange({ name, exchange }) {
  const apiUrl = `${process.env.REACT_APP_API_V2}deleteApiKey/api=${name}&exchange=${exchange}`
  const token = await firebase.auth().currentUser.getIdToken()

  const activate = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'DELETE',
  })

  return activate
}

export async function checkGoogleAuth2FA() {
  const apiUrl = process.env.REACT_APP_API + 'googleauth'
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })

  return response
}

export async function deleteGoogleAuth2FA(auth_answer) {
  const apiUrl = process.env.REACT_APP_API + 'googleauth'
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'DELETE',
    data: {
      auth_answer,
    },
  })

  return response
}

export async function createGoogleAuth2FA() {
  const apiUrl = process.env.REACT_APP_API + 'googleauth/add'
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
  })

  return response
}

export async function saveGoogleAuth2FA({
  auth_answer,
  key,
  title,
  description,
  date,
  type,
}) {
  const apiUrl = process.env.REACT_APP_API + 'googleauth/save'
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: {
      auth_answer,
      key,
      title,
      description,
      date,
      type,
    },
  })

  return response
}

export async function verifyGoogleAuth2FA(auth_answer) {
  const apiUrl = process.env.REACT_APP_API + 'googleauth/verify'
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: {
      auth_answer,
    },
  })

  return response
}

export async function getOpenOrders({
  timestamp,
  limit,
  trade_id,
  apiKeyName,
  exchange,
}) {
  let apiUrl = `${
    process.env.REACT_APP_API_V2
  }orders?apiKeyName=${apiKeyName}&exchange=${capitalize(exchange)}&limit=${
    limit || 50
  }`
  apiUrl += timestamp ? `&timestamp=${timestamp}` : ''
  apiUrl += trade_id ? `&trade_id=${trade_id}` : ''

  const token = await firebase.auth().currentUser.getIdToken()
  const openOrders = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })
  return openOrders.data
}

export async function getAnalytics({
  startDate,
  endDate,
  apiKeyName,
  exchange,
  skipCache,
}) {
  let apiUrl = `${process.env.REACT_APP_ANALYTICS_API}?api_key=${apiKeyName}&exchange=${exchange}`
  if (startDate) apiUrl += `&start_date=${startDate}`
  if (endDate) apiUrl += `&end_date=${endDate}`
  if (skipCache) apiUrl += `&skip_cache=true`

  const token = await firebase.auth().currentUser.getIdToken()
  const { data } = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })
  return data
}

export async function cancelTradeOrder({
  trade_id,
  symbol,
  apiKeyName,
  exchange,
}) {
  const apiUrl = `${process.env.REACT_APP_API_V2}trade/cancel?exchange=${exchange}&apiKeyName=${apiKeyName}`
  const token = await firebase.auth().currentUser.getIdToken()
  const cancelTradeOrderResp = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: {
      trade_id,
      symbol,
    },
  })
  return cancelTradeOrderResp
}

export async function getOrdersHistory({
  updateTime,
  symbol,
  orderId,
  apiKeyName,
  exchange,
}) {
  const apiUrl =
    process.env.REACT_APP_API_V2 +
    'orderhistory?limit=50' +
    '&apiKeyName=' +
    apiKeyName +
    '&exchange=' +
    capitalize(exchange) +
    (updateTime ? '&updateTime=' + parseInt(updateTime) : '') +
    (symbol ? '&symbol=' + symbol : '') +
    (orderId ? '&orderId=' + orderId : '')

  const token = await firebase.auth().currentUser.getIdToken()
  const openOrders = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })
  return openOrders.data
}

export async function loadNotificationChannels() {
  const apiUrl = process.env.REACT_APP_API + 'loadNotificationChannels'

  const token = await firebase.auth().currentUser.getIdToken()
  const loadNotificationChannels = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })
  return loadNotificationChannels.data
}

export async function setTelegramNotification(enable) {
  const apiUrl =
    process.env.REACT_APP_API + `setTelegramNotification?enable=${enable}`

  const token = await firebase.auth().currentUser.getIdToken()
  const setTelegramNotification = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
  })
  return setTelegramNotification
}

export async function setEmailNotification(enable) {
  const apiUrl =
    process.env.REACT_APP_API + `setEmailNotification?enable=${enable}`

  const token = await firebase.auth().currentUser.getIdToken()
  const setEmailNotification = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
  })
  return setEmailNotification
}

export async function connectTelegramLoadKey() {
  const apiUrl = process.env.REACT_APP_API + `connectTelegramLoadKey`

  const token = await firebase.auth().currentUser.getIdToken()
  const connectTelegramLoadKey = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })
  return connectTelegramLoadKey.data
}

export async function disconnectTelegram() {
  const apiUrl = process.env.REACT_APP_API + `disconnectTelegram`

  const token = await firebase.auth().currentUser.getIdToken()
  const disconnectTelegram = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
  })
  return disconnectTelegram.data
}

export async function storeNotificationToken(fcmToken) {
  const apiUrl =
    process.env.REACT_APP_API +
    `notification/token?notification_token=${fcmToken}`
  const token = await firebase.auth().currentUser.getIdToken()
  const notifData = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
  })
  return notifData.data
}

export async function getPositionsList({ apiKeyName, exchange }) {
  const apiUrl = `${process.env.REACT_APP_POSITION_API}list?apikeyname=${apiKeyName}&exchange=${exchange}`
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })

  return response
}

export async function saveChartIntervals(cIntervals) {
  const apiUrl = `${process.env.REACT_APP_API}chart/interval`
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: { intervals: cIntervals },
  })

  return response?.data?.intervals || []
}

export async function createPriceAlert(data) {
  const apiUrl = `${process.env.REACT_APP_API_V2}PriceAlert/create`
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data,
  })

  return response?.data
}

export async function updatePriceAlert(id, data) {
  const apiUrl = `${process.env.REACT_APP_API_V2}PriceAlert/update/${id}`
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data,
  })

  return response?.data
}

export async function getPriceAlerts() {
  const apiUrl = `${process.env.REACT_APP_API_V2}PriceAlert/list`
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })

  return response?.data
}

export async function deletePriceAlert(id) {
  const apiUrl = `${process.env.REACT_APP_API_V2}PriceAlert/delete/${id}`
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'DELETE',
  })

  return response?.data
}

export async function reactivatePriceAlert(id) {
  const apiUrl = `${process.env.REACT_APP_API_V2}PriceAlert/reactive/${id}`
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
  })

  return response?.data
}

export async function dismissNotice(notice_id) {
  const apiUrl = process.env.REACT_APP_API + `notice`
  const token = await firebase.auth().currentUser?.getIdToken()
  const resp = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: { notice_id },
  })
  return resp?.data
}

export async function saveLastSelectedMarketSymbol(symbol) {
  const apiUrl = process.env.REACT_APP_API + `chart/lastSelectedSymbol`
  const token = await firebase.auth().currentUser?.getIdToken()
  const noticeData = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: { lastSelectedSymbol: symbol },
  })
  return noticeData?.data
}

export async function saveTimeZone(timezone) {
  const apiUrl = process.env.REACT_APP_API + `chart/timezone`
  const token = await firebase.auth().currentUser?.getIdToken()
  const noticeData = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: { timeZone: timezone },
  })
  return noticeData?.data
}

export async function callCloudFunction(funcName) {
  const apiUrl = `https://europe-west1-${process.env.REACT_APP_FIREBASE_PROJECT_ID}.cloudfunctions.net/${funcName}`
  const token = await firebase.auth().currentUser?.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: { data: { returnUrl: window.location.origin } },
  })
  return response?.data
}
export async function editOrder(payload) {
  const apiUrl = `${process.env.REACT_APP_API}orders`
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'PATCH',
    data: { ...payload },
  })
  return response?.data
}

export async function deleteUserAccount() {
  const apiUrl = `${process.env.REACT_APP_API_V2}delete`
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'DELETE',
  })
  return response
}

export async function finishSubscriptionByUser() {
  const apiUrl = `${process.env.REACT_APP_API_SUBSCRIPTION}finish_trial`
  const token = await firebase.auth().currentUser.getIdToken()
  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
  })
  return response
}

export async function createSubscripton(payload, inside = false) {
  const apiUrl = `${process.env.REACT_APP_API_SUBSCRIPTION}${payload.customer_id}/subscription`
  const token = await firebase.auth().currentUser.getIdToken()
  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: inside ? payload.data : payload,
  })
  return response?.data
}

export async function updateUserExchange(data) {
  const apiUrl = `${process.env.REACT_APP_API_V2}updateApiKey`
  const token = await firebase.auth().currentUser.getIdToken()
  const updated = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'PATCH',
    data,
  }).catch((error) => {
    return error?.response
  })
  return updated
}

export async function getStripeClientSecret(payload) {
  const apiUrl = `${process.env.REACT_APP_API_SUBSCRIPTION}${payload.stripeId}/client_secret/${payload.subscriptionId}`
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })

  return response?.data
}

export async function updatePaymentMethod({ data, stripeId }) {
  const apiUrl = `${process.env.REACT_APP_API_SUBSCRIPTION}${stripeId}/default_payment_method`
  const token = await firebase.auth().currentUser.getIdToken()
  const updated = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'PATCH',
    data,
  }).catch((error) => {
    return error?.response
  })
  return updated.data
}

export async function getDefaultPaymentMethod(data) {
  const apiUrl = `${process.env.REACT_APP_API_SUBSCRIPTION}${data.stripeId}/default_payment_method`
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })

  return response.data
}

export async function cancelSubscription(data) {
  const apiUrl = `${process.env.REACT_APP_API_SUBSCRIPTION}${data.stripeId}/subscription/${data.subscriptionId}`
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'DELETE',
  })

  return response
}

export async function changeActivePlan(data) {
  const apiUrl = `${process.env.REACT_APP_API_SUBSCRIPTION}${data.stripeId}/subscription/${data.subscriptionId}/plan`
  const token = await firebase.auth().currentUser.getIdToken()

  const updated = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'PATCH',
    data,
  }).catch((error) => {
    return error?.response
  })
  return updated.data
}
