import React, { createContext, useState, useEffect } from 'react'
import { firebase, messaging } from '../firebase/firebase'
import {
  checkGoogleAuth2FA,
  deleteGoogleAuth2FA,
  saveGoogleAuth2FA,
  validateUser,
  verifyGoogleAuth2FA,
  getUserExchanges,
  updateLastSelectedAPIKey,
  storeNotificationToken,
} from '../api/api'
import { successNotification } from '../components/Notifications'
import { useHistory } from 'react-router'
import Ping from 'ping.js'
import dayjs from 'dayjs'
export const UserContext = createContext()
const T2FA_LOCAL_STORAGE = '2faUserDetails'

const DEFAULT_EXCHANGE = {
  data: {
    apiKeys: [
      {
        apiKeyName: 'binance1',
        exchange: 'binance',
        status: 'Active',
        isLastSelected: true,
      },
    ],
  },
}

const UserContextProvider = ({ children }) => {
  const localStorageUser = localStorage.getItem('user')
  const localStorageRemember = localStorage.getItem('remember')
  const sessionStorageRemember = sessionStorage.getItem('remember')
  const localStorage2faUserDetails = localStorage.getItem(T2FA_LOCAL_STORAGE)
  localStorage.removeItem('tradingview.IntervalWidget.quicks')
  const p = new Ping()
  let initialState = {}
  if (
    localStorageUser !== 'undefined' &&
    (sessionStorageRemember === 'true' || localStorageRemember === 'true')
  ) {
    initialState = {
      user: JSON.parse(localStorageUser),
      ...JSON.parse(localStorage2faUserDetails),
    }
  } else {
    initialState = { user: null, has2FADetails: null, is2FAVerified: false }
  }
  const [state, setState] = useState(initialState)
  const [loadApiKeys, setLoadApiKeys] = useState(false)
  const [loadApiKeysError, setLoadApiKeysError] = useState(false)
  const [userData, setUserData] = useState(false)
  const [userContextLoaded, setUserContextLoaded] = useState(false)
  const [totalExchanges, setTotalExchanges] = useState([])
  const [activeExchange, setActiveExchange] = useState({
    apiKeyName: '',
    exchange: '',
  })
  const [isOnboardingSkipped, setIsOnboardingSkipped] = useState()
  const [loaderText, setLoaderText] = useState(
    'Loading data from new exchange ...'
  )
  const [loaderVisible, setLoaderVisibility] = useState(false)
  const [rememberCheck, setRememberCheck] = useState(false)
  const [isCheckingSub, setIsCheckingSub] = useState(false)
  const [hasSub, setHasSub] = useState(true)
  const [onTour, setOnTour] = useState(false)
  const [isTourStep5, setIsTourStep5] = useState(false)
  const [isTourFinished, setIsTourFinished] = useState(false)
  const [onSecondTour, setOnSecondTour] = useState(false)
  const [tour2CurrentStep, setTour2CurrentStep] = useState(0)
  const [showMarketItems, setShowMarketItems] = useState(false)
  const [needPayment, setNeedPayment] = useState(false)
  const [products, setProducts] = useState([])
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [openOrdersUC, setOpenOrdersUC] = useState([])
  const [delOpenOrders, setDelOpenOrders] = useState(null)
  const [orderHistoryProgressUC, setOrderHistoryProgressUC] = useState('100.00')
  const [orderEdited, setOrderEdited] = useState(false)
  const [isAppOnline, setIsAppOnline] = useState(true)
  const [lastSelectedSymbol, setLastSelectedSymbol] = useState()
  const [showSubModalIfLessThan7Days, setShowSubModal] = useState(false)
  const [trialDaysLeft, setDaysLeft] = useState(0)
  const [isPaidUser, setIsPaidUser] = useState(false)
  const [isException, setIsException] = useState(false)
  const [endTrial, setEndTrial] = useState(false)
  const [chartMirroring, setChartMirroring] = useState(false)
  const [isChartReady, setIsChartReady] = useState(false)

  var urls = [
    'https://cp-cors-proxy-asia-northeast-ywasypvnmq-an.a.run.app/',
    'https://cp-cors-proxy-eu-north-ywasypvnmq-lz.a.run.app/',
    'https://cp-cors-proxy-us-west-ywasypvnmq-uw.a.run.app/',
  ]

  useEffect(() => {
    localStorage.setItem(
      'proxyServer',
      'https://cp-cors-proxy-asia-northeast-ywasypvnmq-an.a.run.app/'
    )
    getUserExchangesAfterFBInit()
    getProducts()
    findFastServer(urls)
  }, [])

  const getProducts = async () => {
    const db = firebase.firestore()
    await db
      .collection('stripe_plans')
      .where('active', '==', true)
      .get()
      .then(async (querySnapshot) => {
        querySnapshot.forEach(async (doc) => {
          const priceSnap = await doc.ref
            .collection('prices')
            .where('active', '==', true)
            .orderBy('unit_amount')
            .get()
          const productData = doc.data()
          productData['id'] = doc.id
          productData['prices'] = []
          priceSnap.docs.forEach(async (doc) => {
            const priceId = doc.id
            const priceData = doc.data()

            productData.prices.push({
              price: (priceData.unit_amount / 100).toFixed(2),
              currency: priceData.currency,
              interval: priceData.interval,
              id: priceId,
            })
          })
          setProducts((products) => [...products, productData])
        })
      })
  }

  const getChartMirroring = async () => {
    try {
      const db = firebase.firestore()
      const currentUser = firebase.auth().currentUser
      await db
        .collection('stripe_users')
        .doc(currentUser.uid)
        .get()
        .then(async (doc) => {
          if (doc.data()?.chartMirroringSignUp) {
            handleOnboardingSkip()
            setChartMirroring(doc.data().chartMirroringSignUp)
          } else {
            setChartMirroring(false)
          }
        })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const value = localStorage.getItem('onboarding')
    if (value === 'skipped') {
      setIsOnboardingSkipped(true)
    } else {
      setIsOnboardingSkipped(false)
    }
  }, [])

  const handleOnboardingSkip = () => {
    localStorage.setItem('onboarding', 'skipped')
    setIsOnboardingSkipped(true)
  }

  const handleOnboardingShow = () => {
    localStorage.removeItem('onboarding')
    setIsOnboardingSkipped(false)
  }

  useEffect(() => {
    if (userData) {
      getSubscriptionsData()
    }
  }, [userData])

  const getCustomClaimRole = async () => {
    const currentUser = firebase.auth().currentUser

    await currentUser.getIdToken(true)
    const decodedToken = await currentUser.getIdTokenResult()
    return decodedToken.claims.stripeRole
  }

  async function findFastServer(urls) {
    return new Promise((resolve, reject) => {
      var results = []
      urls.forEach((url) => {
        results.push(makePing(url))
      })

      Promise.all(results).then(function (values) {
        values.sort((a, b) => {
          return a.time - b.time
        })
        localStorage.setItem('proxyServer', values[0].url)
        resolve(values[0].url)
      })
    })
  }

  function makePing(url) {
    return new Promise(function (resolve, reject) {
      try {
        p.ping(url, function (err, data) {
          resolve({ url: url, time: data })
        })
      } catch (error) {
        console.warn('cannot fetch proxy')
      }
    })
  }

  const getSubscriptionsData = async () => {
    setIsCheckingSub(true)
    const db = firebase.firestore()
    const currentUser = firebase.auth().currentUser
    const cryptoPayments = await db
      .collection('subscriptions')
      .doc(currentUser.email)
      .get()
    const subData = cryptoPayments.data()
    console.log(subData)
    if (subData) {
      const { subscription_status, provider, currency, plan, amount } = subData
      const { seconds } = subData.expiration_date
      const exp = dayjs(seconds * 1000)
      const isExpired = exp.isBefore(dayjs())

      if (provider === 'coinbase') {
        setNeedPayment(isExpired)
        setHasSub(!isExpired)
        setIsPaidUser(!isExpired)
        setSubscriptionData({
          subscription: {
            type: 'crypto',
            status: subscription_status,
          },
          due: seconds,
          priceData: {
            currency,
            unit_amount: amount,
            interval: plan,
          },
        })
      } else if (provider === 'stripe') {
        let trialDays = seconds * 1000 - Date.now()
        trialDays = trialDays / 1000 / 60 / 60 / 24
        let getSubModalShownLastTime = localStorage.getItem('lastSubModal')
        getSubModalShownLastTime = getSubModalShownLastTime
          ? Number(getSubModalShownLastTime)
          : true
        let showSubModal =
          subscription_status === 'trialing' &&
          trialDays < 3 &&
          getSubModalShownLastTime + 86400 < Date.now() / 1000
        if (showSubModal) {
          localStorage.setItem('lastSubModal', parseInt(Date.now() / 1000))
        }
        setShowSubModal(showSubModal)
        setDaysLeft(trialDays)
        setHasSub(
          (subscription_status === 'trialing' ||
            subscription_status === 'active') &&
            !isExpired
        )
        setNeedPayment(
          subscription_status === 'past_due' ||
            subscription_status === 'trialing'
        )
        if (subData?.payment_method_attached)
          setEndTrial(subData.payment_method_attached)
        setIsPaidUser(subscription_status === 'active')
        setSubscriptionData({
          subscription: {
            type: 'stripe',
            status: subscription_status,
          },
          due: seconds,
          priceData: {
            currency,
            unit_amount: amount,
            interval: plan,
          },
        })
      }
    } else {
      setNeedPayment(true)
      setHasSub(false)
      setIsPaidUser(false)
    }

    const exception = await db
      .collection('referrals')
      .doc(currentUser.email)
      .get()
    console.log(exception?.data())
    if (exception?.data()) {
      setIsException(true)
    }
    setIsCheckingSub(false)
  }

  useEffect(() => {
    if (isOnboardingSkipped) {
      getExchanges()
    }
  }, [isOnboardingSkipped])

  async function getExchanges() {
    try {
      let hasKeys = await getUserExchanges()
      if (!hasKeys?.data?.apiKeys?.length && isOnboardingSkipped) {
        hasKeys = DEFAULT_EXCHANGE
      } else {
        handleOnboardingShow()
      }

      if (hasKeys) {
        if (!hasKeys?.data?.apiKeys?.length) {
          setUserContextLoaded(true)
          return
        }
      } else {
        setLoadApiKeysError(true)
      }
      const { apiKeys } = hasKeys.data
      setTotalExchanges(apiKeys)
      let getSavedKey = sessionStorage.getItem('exchangeKey')
      const ssData = JSON.parse(getSavedKey)
      if (
        ssData &&
        apiKeys.findIndex(
          (item) =>
            item.apiKeyName === ssData.apiKeyName &&
            item.exchange === ssData.exchange
        ) > -1
      ) {
        setActiveExchange({ ...ssData })
        if (!isOnboardingSkipped) {
          setLoadApiKeys(true)
        }
      } else {
        let activeKey = apiKeys.find(
          (item) => item.isLastSelected === true && item.status === 'Active'
        )
        if (activeKey) {
          const data = {
            ...activeKey,
            label: `${activeKey.exchange} - ${activeKey.apiKeyName}`,
            value: `${activeKey.exchange} - ${activeKey.apiKeyName}`,
          }
          if (!isOnboardingSkipped) {
            setLoadApiKeys(true) // Only check active api exchange eventually
          }
          setActiveExchange(data)
          sessionStorage.setItem('exchangeKey', JSON.stringify(data))
        } else {
          // find the first one that is 'Active'
          let active = apiKeys.find((item) => item.status === 'Active')
          if (active) {
            await updateLastSelectedAPIKey({ ...active })
            const data = {
              ...active,
              label: `${active.exchange} - ${active.apiKeyName}`,
              value: `${active.exchange} - ${active.apiKeyName}`,
            }
            setActiveExchange(data)
            sessionStorage.setItem('exchangeKey', JSON.stringify(data))
            if (!isOnboardingSkipped) {
              setLoadApiKeys(true)
            }
          }
        }
      }
    } catch (e) {
      console.log(e)
      setLoadApiKeysError(true)
    } finally {
      setUserContextLoaded(true)
    }
  }

  async function FCMSubscription() {
    try {
      const np = await Notification.requestPermission() // "granted", "denied", "default"
      if (np === 'denied') return
      const token = await messaging.getToken() // device specific token to be stored in back-end, check user settings first
      // console.log(`FCM token: ${token}`)
      await storeNotificationToken(token)
      messaging.onMessage((payload) => {
        // console.log(`Received msg in UC onMessage`)
        const { data } = payload
        let apiKey = data?.message_3
        if (!apiKey) return
        apiKey = apiKey.split(':')[1]
        const description = (
          <>
            <p className="mb-0">{data.message_1}</p>
            <p className="mb-0">{data.message_2}</p>
            <p className="mb-0">API Key: {apiKey}</p>
          </>
        )
        successNotification.open({
          message: data.title,
          duration: 3,
          description,
        })
      })
      navigator.serviceWorker.addEventListener('message', () => {
        // console.log(`Received msg in UC serviceWorker.addEventListener`)
      })
    } catch (e) {
      console.log(e)
    }
  }

  const getUserExchangesAfterFBInit = () => {
    firebase.auth().onAuthStateChanged(async (user) => {
      let sessionTimeout = null
      if (user) {
        // User is signed in.
        setUserData(user)
        getExchanges()
        if (firebase.messaging.isSupported()) {
          FCMSubscription()
        }
        user.getIdTokenResult().then((idTokenResult) => {
          // Make sure all the times are in milliseconds!
          const authTime = idTokenResult.claims.auth_time * 1000
          const sessionDuration = 1000 * 60 * 60 * 24
          const millisecondsUntilExpiration =
            sessionDuration - (Date.now() - authTime)
          sessionTimeout = setTimeout(() => {
            logout()
          }, millisecondsUntilExpiration)
        })
      } else {
        // User is signed out.
        sessionTimeout && clearTimeout(sessionTimeout)
        sessionTimeout = null
      }
    })
  }

  async function login(email, password) {
    const signedin = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code
        var errorMessage = error.message
        return { message: errorMessage, code: errorCode }
      })
    if (signedin.code) {
      return signedin
    }

    if (signedin) {
      if (!firebase.auth().currentUser.emailVerified) {
        setState('registered', firebase.auth().currentUser)
        const actionCodeSettings = {
          url:
            window.location.origin +
            '?email=' +
            firebase.auth().currentUser.email,
          handleCodeInApp: true,
        }
        const result = await firebase
          .auth()
          .currentUser.sendEmailVerification(actionCodeSettings)
          .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code
            var errorMessage = error.message
            return { message: errorMessage, code: errorCode }
          })

        if (result && result.code === 'auth/too-many-requests') {
          return { code: 'WAIT_RETRY' }
        }

        return { code: 'EVNEED' }
      }
    }

    // if we get the sign in
    if (signedin) {
      await validateUser()
      let has2FADetails = null
      getChartMirroring()
      try {
        getUserExchangesAfterFBInit()
        const response = await checkGoogleAuth2FA()
        has2FADetails = response.data
        localStorage.setItem(
          T2FA_LOCAL_STORAGE,
          JSON.stringify({ has2FADetails })
        )
      } catch (error) {}
      setState({ user: signedin.user, has2FADetails })
      localStorage.setItem('user', JSON.stringify(signedin.user))
      localStorage.setItem('remember', rememberCheck)
    }

    localStorage.removeItem('registered')

    return signedin
  }

  async function add2FA(t2faData) {
    const response = await saveGoogleAuth2FA({
      auth_answer: t2faData.auth_answer,
      key: t2faData.key,
      title: t2faData.title,
      description: t2faData.description,
      date: t2faData.date,
      type: t2faData.type,
    })
    const has2FADetails = {
      title: t2faData.title,
      description: t2faData.description,
      date: t2faData.date,
      type: t2faData.type,
    }
    localStorage.setItem(
      T2FA_LOCAL_STORAGE,
      JSON.stringify({ has2FADetails, is2FAVerified: true })
    )
    setState({ ...state, has2FADetails, is2FAVerified: true })
    return response.data
  }

  function get2FADetails() {
    return state.has2FADetails
  }

  async function verify2FA(userToken) {
    const response = await verifyGoogleAuth2FA(userToken)
    if (response.data.passed) {
      localStorage.setItem(
        T2FA_LOCAL_STORAGE,
        JSON.stringify({
          has2FADetails: state.has2FADetails,
          is2FAVerified: true,
        })
      )
      setState({ ...state, is2FAVerified: true })
    }

    return response.data.passed
  }

  async function delete2FA(userToken) {
    await deleteGoogleAuth2FA(userToken)
    setState({ ...state, has2FADetails: null, is2FAVerified: true })
    localStorage.removeItem(T2FA_LOCAL_STORAGE)
  }

  // LOGOUT
  function logout() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        const theme = localStorage.getItem('theme')
        localStorage.clear()
        if (theme) localStorage.setItem('theme', theme)
        sessionStorage.clear()
        window.location = window.origin + '/login'
      })
      .catch((e) => {
        console.log(e)
      })
  }

  // REGISTER NEW USER
  async function register(email, password) {
    const registered = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code
        var errorMessage = error.message
        console.error({ message: errorMessage, code: errorCode })
        return { message: errorMessage, code: errorCode }
      })

    setState({ registered: registered.user })
    localStorage.setItem('registered', JSON.stringify(registered.user))

    return registered
  }

  async function sendEmailAgain() {
    if (state.registered) {
      const actionCodeSettings = {
        url:
          window.location.origin +
          '?email=' +
          firebase.auth().currentUser.email,
        handleCodeInApp: true,
      }

      firebase.auth().currentUser.sendEmailVerification(actionCodeSettings)
    } else {
      console.log('no registered')
    }
  }

  async function isRegistered() {
    try {
      return await JSON.parse(localStorage.getItem('registered'))
    } catch (error) {
      console.error(error)
      return {
        message: 'Not registered',
      }
    }
  }

  const devENV = process.NODE_ENV !== 'production' ? true : false
  const isLoggedIn =
    state && state.user && (!state.has2FADetails || state.is2FAVerified)
  const isLoggedInWithFirebase = state && state.user

  if (isLoggedIn) sessionStorage.setItem('remember', true)
  return (
    <UserContext.Provider
      value={{
        login,
        logout,
        register,
        isRegistered,
        isLoggedIn,
        isLoggedInWithFirebase,
        add2FA,
        verify2FA,
        get2FADetails,
        delete2FA,
        sendEmailAgain,
        setLoadApiKeys,
        loadApiKeys,
        loadApiKeysError,
        setLoadApiKeysError,
        activeExchange,
        setActiveExchange,
        userContextLoaded,
        totalExchanges,
        setTotalExchanges,
        loaderVisible,
        setLoaderVisibility,
        loaderText,
        setLoaderText,
        userData,
        isException,
        setUserData,
        rememberCheck,
        setRememberCheck,
        devENV,
        endTrial,
        isCheckingSub,
        hasSub,
        onTour,
        isTourStep5,
        isTourFinished,
        onSecondTour,
        tour2CurrentStep,
        showMarketItems,
        needPayment,
        products,
        subscriptionData,
        // subInfo,
        // setSubInfo,
        setHasSub,
        isPaidUser,
        setIsPaidUser,
        setOnTour,
        setIsTourStep5,
        setIsTourFinished,
        setOnSecondTour,
        setTour2CurrentStep,
        setShowMarketItems,
        getSubscriptionsData,
        orderHistoryProgressUC,
        setOrderHistoryProgressUC,
        orderEdited,
        setOrderEdited,
        openOrdersUC,
        setOpenOrdersUC,
        delOpenOrders,
        setDelOpenOrders,
        isAppOnline,
        setIsAppOnline,
        lastSelectedSymbol,
        setLastSelectedSymbol,
        showSubModalIfLessThan7Days,
        setShowSubModal,
        trialDaysLeft,
        handleOnboardingSkip,
        isOnboardingSkipped,
        handleOnboardingShow,
        isChartReady,
        setIsChartReady,
        setSubscriptionData,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserContextProvider
