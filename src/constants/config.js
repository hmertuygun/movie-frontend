const config = {
  subscription: true,
  cryptoPayment: true,
}

const URLS = [
  'https://cp-cors-proxy-asia-northeast-ywasypvnmq-an.a.run.app/',
  'https://cp-cors-proxy-eu-north-ywasypvnmq-lz.a.run.app/',
  'https://cp-cors-proxy-us-west-ywasypvnmq-uw.a.run.app/',
]

const BASE_URL = process.env.REACT_APP_API
const BASE_V2_URL = process.env.REACT_APP_API_V2
const USER_ACTION_URL = process.env.REACT_APP_USER_ACTIONS_API
const SUBSCRIPTION_URL = process.env.REACT_APP_API_SUBSCRIPTION
const PROJECT_ID = process.env.REACT_APP_FIREBASE_PROJECT_ID
const API_URLS = {
  chart: `${BASE_URL}chart`,
  analyst: `${BASE_URL}analysts`,
  'user-data': `${BASE_V2_URL}user_data`,
  user: `${BASE_V2_URL}user`,
  'api-key': `${BASE_V2_URL}apikeys`,
  subscription: `${BASE_V2_URL}subscription`,
  'platform-messages': `${BASE_V2_URL}platform_messages`,
  notice: `${BASE_URL}notice`,
  referrals: `${BASE_V2_URL}referrals`,
  'stripe-users': `${BASE_V2_URL}stripe_users`,
  'stripe-plans': `${BASE_V2_URL}stripe_plans`,
  watchlist: `${BASE_V2_URL}watch_list`,
}

export {
  config,
  URLS,
  API_URLS,
  BASE_URL,
  BASE_V2_URL,
  USER_ACTION_URL,
  SUBSCRIPTION_URL,
  PROJECT_ID,
}
