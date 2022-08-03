import { FEATURES } from 'constants/Features'
import store from 'store'

const allowedFeatures = (arr) => {
  const features = userAllowedFeature()
  return arr.filter((item) => features.includes(item.toLowerCase()))
}

const userAllowedFeature = () => {
  const { users } = store.getState()
  const { isCanaryUser } = users
  return FEATURES[isCanaryUser ? 'canary' : 'normal']
}

export { allowedFeatures }
