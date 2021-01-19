import axios from 'axios'
import { firebase } from '../firebase/firebase'

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

export async function placeOrder({ entry, targets, stoploss }) {
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
  }

  console.log({ dataToBeSent: data })

  const apiUrl = process.env.REACT_APP_API + 'createFullTrade'
  const token = await firebase.auth().currentUser.getIdToken()
  const fullTrade = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data,
  })

  return fullTrade
}

// make sure users can be recognized by user component
export async function validateUser() {
  const apiUrl = process.env.REACT_APP_API + 'register'

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

export async function getBalance(symbol) {
  const apiUrl = process.env.REACT_APP_API + 'balance/' + symbol
  const token = await firebase.auth().currentUser.getIdToken()

  const response = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })

  return response
}


export async function getLastPrice(symbol) {
  const apiUrl = process.env.REACT_APP_API + 'lastprice/' + symbol + '?symbol=' + symbol
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
  const apiUrl = process.env.REACT_APP_API + 'addApiKey'
  const token = await firebase.auth().currentUser.getIdToken()

  try {
    const added = await axios(apiUrl, {
      headers: await getHeaders(token),
      method: 'POST',
      data: { apiKey, apiKeyName: name, signSecret: secret, exchange },
    })

    return added
  } catch (error) {
    console.error(error)
    return error
  }
}

export async function getUserExchanges() {
  const apiUrl = process.env.REACT_APP_API + 'loadApiKeys'
  const token = await firebase.auth().currentUser.getIdToken()

  const exchanges = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })

  return exchanges
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

export async function deleteUserExchange(apiKeyName) {
  const apiUrl = process.env.REACT_APP_API + 'deleteApiKey/' + apiKeyName
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

export async function getOpenOrders({ timestamp, trade_id }) {
  const apiUrl =
    process.env.REACT_APP_API +
    'orders?exchange=Binance&limit=50&in_pending=true' +
    (timestamp ? '&timestamp=' + timestamp : '') +
    (trade_id ? '&trade_id=' + trade_id : '')
  const token = await firebase.auth().currentUser.getIdToken()
  const openOrders = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'GET',
  })
  return openOrders.data
}

export async function cancelTradeOrder(trade_id) {
  const apiUrl = process.env.REACT_APP_API + 'trade/cancel'
  const token = await firebase.auth().currentUser.getIdToken()
  const cancelTradeOrderResp = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: {
      trade_id,
    },
  })
  return cancelTradeOrderResp.data
}

export async function getOrdersHistory({ updateTime, symbol, orderId }) {
  const apiUrl =
    process.env.REACT_APP_API +
    'orderhistory?exchange=Binance&limit=50' +
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
