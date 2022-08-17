import rs from 'jsrsasign'

import { firebase } from 'services/firebase'
import getPublicKey from 'utils/getPublicKeys'

const signToken = async (signature, response) => {
  const userToken = await firebase.auth().currentUser?.getIdToken()
  const publicKey = getPublicKey()

  response.data['firebase_user_token'] = userToken

  var sMsg = JSON.stringify(response.data)
  var hSig = signature
  hSig = hSig.replace(/[^0-9a-f]+/g, '')

  var pubKey = rs.KEYUTIL.getKey(publicKey)
  var isValid = pubKey.verify(sMsg, hSig)

  if (isValid) return response

  throw new Error('Invalid signature')
}

export default signToken
