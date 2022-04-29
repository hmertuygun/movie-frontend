import { firebase } from 'services/firebase'

const getHeaders = async (token) => {
  const userToken = await firebase.auth().currentUser?.getIdToken()
  const methods = 'GET, POST, PUT, PATCH, POST, DELETE, OPTIONS'
  return {
    'Content-Type': 'application/json;charset=UTF-8',
    Authorization: `Bearer ${token ? token : userToken}`,
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export { getHeaders }
