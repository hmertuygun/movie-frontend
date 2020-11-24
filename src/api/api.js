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

export async function getPositions() {
  const apiUrl = process.env.REACT_APP_API + 'v1/usercomp/positions'

  const token = await firebase.auth().currentUser.getIdToken()
  const positions = await fetch(apiUrl, {
    headers: await getHeaders(token),
  }).then((res) => res.json())

  return positions
}

export async function setPositions({ position = { position: 'ErikP in the house' } }) {
  const apiUrl = process.env.REACT_APP_API + 'v1/usercomp/positions'

  const token = await firebase.auth().currentUser.getIdToken()
  const positions = await axios(apiUrl, {
    headers: await getHeaders(token),
    method: 'POST',
    data: { position },
  })

  return positions
}