import axios from 'axios'
import { firebase } from '../firebase/firebase'
import capitalize from '../helpers/capitalizeFirstLetter'

function getLocalUserData() {
  let userData = localStorage.getItem('user')
  if (!userData) return ''
  userData = JSON.parse(userData)
  return userData?.stsTokenManager?.accessToken || ''
}

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
  const apiUrl = process.env.REACT_APP_API + 'exchange'
  const token = await firebase.auth().currentUser.getIdToken()
  const exchanges = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })
  return exchanges.data
}

export async function getBalance({ symbol, apiKeyName, exchange }) {
  const apiUrl = `${process.env.REACT_APP_API_V2
    }balance/${symbol}?apiKeyName=${apiKeyName}&exchange=${capitalize(exchange)}`
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })

  return response
}

export async function getLastPrice(symbol) {
  const apiUrl =
    process.env.REACT_APP_API + 'lastprice/' + symbol + '?symbol=' + symbol
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })

  return response
}

// {
//   "apiKey": "FriendshipIsMagic",
//   "signSecret": "Tralalala",
//   "exchange": "binance"
// }
export async function addUserExchange({ name, apiKey, secret, exchange }) {
  const apiUrl = process.env.REACT_APP_API_V2 + 'addApiKey'
  const token = await firebase.auth().currentUser.getIdToken()
  const added = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: {
      apiKey,
      apiKeyName: name.toLowerCase(),
      signSecret: secret,
      exchange,
    },
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
  } catch (error) {
    console.log(error)
  }
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

export async function getOpenOrders({ timestamp, limit, trade_id, apiKeyName, exchange }) {
  const apiUrl = `${process.env.REACT_APP_API_V2}orders?apiKeyName=${apiKeyName}&exchange=${capitalize(exchange)}&limit=${limit || 50}
                  ${timestamp ? `&timestamp=${timestamp}` : ''}${trade_id ? `&trade_id=${trade_id}` : ''}`

  const token = await firebase.auth().currentUser.getIdToken()
  const openOrders = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })
  return openOrders.data
}

export async function cancelTradeOrder({ trade_id, symbol, apiKeyName, exchange }) {
  const apiUrl = `${process.env.REACT_APP_API_V2}trade/cancel?exchange=${exchange}&apiKeyName=${apiKeyName}`
  const token = await firebase.auth().currentUser.getIdToken()
  const cancelTradeOrderResp = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: {
      trade_id,
      symbol
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
    (updateTime ? '&updateTime=' + updateTime : '') +
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
  const apiUrl = process.env.REACT_APP_API + `setTelegramNotification?enable=${enable}`

  const token = await firebase.auth().currentUser.getIdToken()
  const setTelegramNotification = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
  })
  return setTelegramNotification
}

export async function setEmailNotification(enable) {
  const apiUrl = process.env.REACT_APP_API + `setEmailNotification?enable=${enable}`

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

export async function getChartDrawing(name) {
  const apiUrl = process.env.REACT_APP_API + `chart/drawing?drawing_name=${name}`
  const token = await firebase.auth().currentUser.getIdToken()
  const chartDrawingData = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })
  return chartDrawingData.data
}

export async function saveChartDrawing(name, image) {
  const apiUrl = process.env.REACT_APP_API + `chart/drawing`
  const token = await firebase.auth().currentUser.getIdToken()
  const chartDrawingData = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: {
      name,
      image
    },
  })
  return chartDrawingData.data
}