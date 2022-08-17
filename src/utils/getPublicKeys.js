import ProdKey from '../keys/prod.public'
import DevKey from '../keys/dev.public'

export default function getPublicKey() {
  if (process.env.REACT_APP_FIREBASE_PROJECT_ID === 'coinpanel-dev')
    return DevKey

  return ProdKey
}
