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
    const { side, type, symbol, quantity, price } = target
    return {
      targetNumber: index + 1,
      percentage: (target.quantity / entry.quantity) * 100,
      quantity,
      side,
      type,
      symbol,
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

export async function setPositions({
  position = { position: 'ErikP in the house' },
}) {
  const apiUrl = process.env.REACT_APP_API + 'usercomp/positions'

  const token = await firebase.auth().currentUser.getIdToken()
  const positions = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: { position },
  })

  return positions
}
