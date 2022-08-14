import { firebase } from 'services/firebase'
import store from 'store'

const getHeaders = async () => {
  const userToken = await firebase.auth().currentUser?.getIdToken()
  const { apiKeys } = store.getState()
  const methods = 'GET, POST, PUT, PATCH, POST, DELETE, OPTIONS'

  return {
    'Content-Type': 'application/json;charset=UTF-8',
    Authorization: `Bearer ${userToken}`,
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'x-token': apiKeys.secretKey,
  }
}

export { getHeaders }
