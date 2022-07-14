import React, { createContext, useState, useEffect } from 'react'
import { useNotifications } from 'reapop'
import { firebase, messaging } from 'services/firebase'

import {
  checkGoogleAuth2FA,
  deleteGoogleAuth2FA,
  saveGoogleAuth2FA,
  verifyGoogleAuth2FA,
  storeNotificationToken,
  validateUser,
  updateLastSelectedAPIKey,
  getFirestoreCollectionData,
  getFirestoreDocumentData,
  getSnapShotCollection,
  sendLoginInfo,
  getDoubleCollection,
} from 'services/api'
import Ping from 'utils/ping'
import dayjs from 'dayjs'
import { sortExchangesData } from 'utils/apiKeys'
import { storage, session } from 'services/storages'
import { getSocketEndpoint } from 'services/exchanges'
import { config } from 'constants/config'
import { consoleLogger } from 'utils/logger'
export const UserContext = createContext()
const T2FA_LOCAL_STORAGE = '2faUserDetails'

const DEFAULT_EXCHANGE = [
  {
    apiKeyName: 'default',
    exchange: 'binance',
    status: 'Active',
    default: true,
    isLastSelected: true,
  },
]

const UserContextProvider = ({ children }) => {
  const { notify } = useNotifications()
  const localStorageUser = storage.get('user', true)
  const localStorageRemember = storage.get('remember')
  const sessionStorageRemember = session.get('remember')
  const localStorage2faUserDetails = storage.get(T2FA_LOCAL_STORAGE, true)
  storage.remove('tradingview.IntervalWidget.quicks')
  const p = new Ping({ favicon: '' })
  let initialState = {}
  if (
    localStorageUser !== 'undefined' &&
    (sessionStorageRemember === 'true' || localStorageRemember === 'true')
  ) {
    initialState = {
      user: localStorageUser,
      ...localStorage2faUserDetails,
    }
  } else {
    initialState = { user: null, has2FADetails: null, is2FAVerified: false }
  }
  const [state, setState] = useState(initialState)
  const [loadApiKeys, setLoadApiKeys] = useState(false)
  const [loadApiKeysError, setLoadApiKeysError] = useState(false)
  const [userData, setUserData] = useState(false)
  const [userContextLoaded, setUserContextLoaded] = useState(false)
  const [isSubOpen, setIsSubOpen] = useState(config.subscription)
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
  const [isApiKeysLoading, setIsApiKeysLoading] = useState(false)
  const [activeDrawingId, setActiveDrawingId] = useState(false)
  const [activeDrawing, setActiveDrawing] = useState(false)
  const [addedDrawing, setAddedDrawing] = useState({})
  const [twofaSecretKey, setTwofaSecretKey] = useState('')
  const [firstLogin, setFirstLogin] = useState('')
  const [country, setCountry] = useState('')
  const [isCountryAvailable, setIsCountryAvailable] = useState(true)
  const [chartDrawings, setChartDrawings] = useState()
  const [settingChartDrawings, isSettingChartDrawings] = useState(false)
  const [createSubscription, setCreateSubscription] = useState(false)
  const [subscriptionError, setSubscriptionError] = useState('')
  const [allAnalysts, setAllAnalysts] = useState([])
  const [isAnalyst, setIsAnalyst] = useState([])

  var urls = [
    'https://cp-cors-proxy-asia-northeast-ywasypvnmq-an.a.run.app/',
    'https://cp-cors-proxy-eu-north-ywasypvnmq-lz.a.run.app/',
    'https://cp-cors-proxy-us-west-ywasypvnmq-uw.a.run.app/',
  ]

  useEffect(() => {
    storage.set(
      'proxyServer',
      'https://cp-cors-proxy-asia-northeast-ywasypvnmq-an.a.run.app/'
    )
    getUserExchangesAfterFBInit()
    getProducts()
    findFastServer(urls)
  }, [])

  useEffect(() => {
    if (userData.email) {
      if (!country) {
        handleCountry()
      }
      fetchAnalysts()
    }
  }, [country, isCountryAvailable, userData])

  const fetchAnalysts = async () => {
    try {
      const snapshot = await getSnapShotCollection('analysts').get()
      const analysts = snapshot.docs.map((doc) => {
        if (doc.data().enabled) return { ...doc.data(), id: doc.id }

        return null
      })
      setAllAnalysts(analysts)
      const checkAnalyst = analysts.find((analyst) => {
        return analyst.id === userData.email
      })
      setIsAnalyst(!!checkAnalyst)
    } catch (error) {
      consoleLogger(error)
    }
  }

  const handleCountry = async () => {
    await firebase
      .firestore()
      .collection('user_data')
      .doc(userData.email)
      .get()
      .then((doc) => {
        if (doc && doc.data()) {
          setCountry(doc.data().country)
          setState((state) => {
            return { ...state, firstLogin: doc.data().firstLogin }
          })
          setIsCountryAvailable(true)
        } else {
          setIsCountryAvailable(false)
        }
      })
  }

  const getProducts = async () => {
    await getFirestoreCollectionData('stripe_plans', true).then(
      async (querySnapshot) => {
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
      }
    )
  }

  const getChartMirroring = async () => {
    //test
    try {
      const currentUser = firebase.auth().currentUser
      getFirestoreDocumentData('stripe_users', currentUser.uid).then(
        async (doc) => {
          if (doc.data()?.chartMirroringSignUp) {
            handleOnboardingSkip()
            setChartMirroring(doc.data().chartMirroringSignUp)
          } else {
            setChartMirroring(false)
          }
        }
      )
    } catch (error) {
      consoleLogger(error)
    }
  }

  useEffect(() => {
    const value = storage.get('onboarding')
    if (value === 'skipped') {
      setIsOnboardingSkipped(true)
    } else {
      setIsOnboardingSkipped(false)
    }
  }, [])

  const handleOnboardingSkip = () => {
    storage.set('onboarding', 'skipped')
    setIsOnboardingSkipped(true)
  }

  const handleOnboardingShow = () => {
    storage.remove('onboarding')
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
    return new Promise(async (resolve, reject) => {
      var results = []
      urls.forEach((url) => {
        results.push(makePing(url))
      })

      await getSocketEndpoint('kucoin')

      Promise.all(results).then(function (values) {
        values.sort((a, b) => {
          return a.time - b.time
        })
        storage.set('proxyServer', values[0].url)
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
        consoleLogger('cannot fetch proxy')
      }
    })
  }

  const getSubscriptionsData = async () => {
    setIsCheckingSub(true)
    const currentUser = firebase.auth().currentUser
    const cryptoPayments = await getFirestoreDocumentData(
      'subscriptions',
      currentUser.email
    )

    const subData = cryptoPayments.data()
    if (subData && subData.expiration_date && !state.firstLogin) {
      const { subscription_status, provider, currency, plan, amount } = subData
      let errorMessage = subData && subData.error_message
      let scheduledSubs = subData && subData.subscription_scheduled
      if (errorMessage) {
        setSubscriptionError(errorMessage)
      } else {
        setSubscriptionError('')
      }

      const { seconds } = subData.expiration_date
      const exp = dayjs(seconds * 1000)
      const isExpired = exp.isBefore(dayjs())
      if (provider === 'coinbase') {
        setNeedPayment(subscription_status === 'trailing')
        setHasSub(!isExpired)
        setIsPaidUser(!isExpired)
        setCreateSubscription(
          subscription_status === 'cancelled' ||
            subscription_status === 'canceled'
        )
        setSubscriptionData({
          subscription: {
            type: 'crypto',
            status: !isExpired ? 'active' : 'unpaid',
          },
          due: seconds,
          priceData: {
            currency,
            unit_amount: amount,
            interval: plan,
          },
        })
      } else if (provider === 'stripe' || provider === 'coinpanel') {
        let trialDays = seconds * 1000 - Date.now()
        trialDays = trialDays / 1000 / 60 / 60 / 24
        let getSubModalShownLastTime = storage.get('lastSubModal')
        getSubModalShownLastTime = getSubModalShownLastTime
          ? Number(getSubModalShownLastTime)
          : true
        let showSubModal =
          subscription_status === 'trialing' &&
          trialDays < 3 &&
          getSubModalShownLastTime + 86400 < Date.now() / 1000
        if (showSubModal) {
          storage.set('lastSubModal', parseInt(Date.now() / 1000))
        }
        setShowSubModal(showSubModal)
        setDaysLeft(trialDays)
        setHasSub(
          (subscription_status === 'trialing' ||
            subscription_status === 'active' ||
            subscription_status === 'canceled' ||
            subscription_status === 'cancelled') &&
            !isExpired
        )
        setCreateSubscription(
          subscription_status === 'canceled' ||
            subscription_status === 'cancelled'
        )
        setNeedPayment(subscription_status === 'trialing')
        if (subData?.payment_method_attached)
          setEndTrial(subData.payment_method_attached)
        setIsPaidUser(subscription_status === 'active')
        const checkCoupon = await getDoubleCollection(
          'subscriptions',
          'coupons_used',
          userData.email
        )
        setSubscriptionData({
          subscription: {
            type: 'stripe',
            status: subscription_status,
          },
          due: seconds,
          couponUsed: checkCoupon.docs.length > 0,
          priceData: {
            currency,
            unit_amount: amount,
            interval: plan,
          },
          scheduledSubs,
        })
      }
    } else {
      setNeedPayment(true)
      setHasSub(false)
      setIsPaidUser(false)
      setCreateSubscription(true)
    }

    const exception = await getFirestoreDocumentData(
      'referrals',
      currentUser.email
    )

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

  useEffect(() => {
    getExchanges()
  }, [userData.email])

  function getExchanges() {
    if (userData.email) {
      setIsApiKeysLoading(true)
      try {
        getFirestoreDocumentData('apiKeyIDs', userData.email).then((apiKey) => {
          if (apiKey.data()) {
            setIsApiKeysLoading(false)
            setUserContextLoaded(true)
            let apiKeys = sortExchangesData(apiKey.data())
            if (!apiKeys?.length && isOnboardingSkipped) {
              apiKeys = DEFAULT_EXCHANGE
            } else {
              handleOnboardingShow()
            }

            if (apiKeys) {
              if (!apiKeys?.length) {
                setUserContextLoaded(true)
                return
              }
            } else {
              setLoadApiKeysError(true)
            }
            setTotalExchanges(apiKeys)
            let getSavedKey = session.get('exchangeKey')
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
                (item) =>
                  item.isLastSelected === true && item.status === 'Active'
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
                session.set('exchangeKey', JSON.stringify(data))
              } else {
                // find the first one that is 'Active'
                let active = apiKeys.find((item) => item.status === 'Active')
                if (active) {
                  updateLastSelectedAPIKey({ ...active })
                  const data = {
                    ...active,
                    label: `${active.exchange} - ${active.apiKeyName}`,
                    value: `${active.exchange} - ${active.apiKeyName}`,
                  }
                  setActiveExchange(data)
                  session.set('exchangeKey', JSON.stringify(data))
                  if (!isOnboardingSkipped) {
                    setLoadApiKeys(true)
                  }
                }
              }
            }
          }
        })
      } catch (e) {
        consoleLogger(e)
        setIsApiKeysLoading(false)
        setLoadApiKeysError(true)
        setUserContextLoaded(true)
      }
    }
  }

  async function FCMSubscription() {
    try {
      const np = await Notification.requestPermission() // "granted", "denied", "default"
      if (np === 'denied') return
      const token = await messaging.getToken() // device specific token to be stored in back-end, check user settings first
      // consoleLogger(`FCM token: ${token}`)
      await storeNotificationToken(token)
      messaging.onMessage((payload) => {
        // consoleLogger(`Received msg in UC onMessage`)
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
        notify({
          status: 'success',
          title: data.title,
          message: description,
        })
      })
      navigator.serviceWorker.addEventListener('message', () => {
        // consoleLogger(`Received msg in UC serviceWorker.addEventListener`)
      })
    } catch (e) {
      consoleLogger(e)
    }
  }

  const getUserExchangesAfterFBInit = () => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in.
        setUserData(user)
        getExchanges()
        if (firebase.messaging.isSupported()) {
          FCMSubscription()
        }
      } else {
        // User is signed out.
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
        storage.set(T2FA_LOCAL_STORAGE, JSON.stringify({ has2FADetails }))
      } catch (error) {}
      setState((state) => {
        return { ...state, user: signedin.user, has2FADetails }
      })
      storage.set('user', JSON.stringify(signedin.user))
      storage.set('remember', rememberCheck)
      await sendLoginInfo()
    }

    storage.remove('registered')

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
    if (!response?.data) {
      throw new Error('Error adding 2FA')
    }

    const has2FADetails = {
      title: t2faData.title,
      description: t2faData.description,
      date: t2faData.date,
      type: t2faData.type,
    }
    storage.set(
      T2FA_LOCAL_STORAGE,
      JSON.stringify({ has2FADetails, is2FAVerified: true })
    )
    setState((state) => {
      return { ...state, has2FADetails, is2FAVerified: true }
    })
    return response.data
  }

  function get2FADetails() {
    return state.has2FADetails
  }

  async function verify2FA(userToken) {
    const response = await verifyGoogleAuth2FA(userToken)
    if (response.data.passed) {
      storage.set(
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
    setState((state) => {
      return { ...state, has2FADetails: null, is2FAVerified: true }
    })
    storage.remove(T2FA_LOCAL_STORAGE)
  }

  // LOGOUT
  function logout() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        const theme = storage.get('theme')
        storage.clear()
        if (theme) storage.set('theme', theme)
        session.clear()
        window.location = window.origin + '/login'
      })
      .catch((e) => {
        consoleLogger(e)
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
        consoleLogger({ message: errorMessage, code: errorCode })
        return { message: errorMessage, code: errorCode }
      })

    setState((state) => {
      return { ...state, registered: registered.user }
    })
    storage.set('registered', JSON.stringify(registered.user))

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
      consoleLogger('no registered')
    }
  }

  async function isRegistered() {
    try {
      return await storage.get('registered', true)
    } catch (error) {
      consoleLogger(error)
      return {
        message: 'Not registered',
      }
    }
  }

  const devENV = process.NODE_ENV !== 'production' ? true : false
  const isLoggedIn =
    state && state.user && (!state.has2FADetails || state.is2FAVerified)
  const isLoggedInWithFirebase = state && state.user

  if (isLoggedIn) session.set('remember', true)
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
        isSubOpen,
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
        allAnalysts,
        isAnalyst,
        // subInfo,
        // setSubInfo,
        setHasSub,
        setFirstLogin,
        isPaidUser,
        setIsPaidUser,
        setOnTour,
        setState,
        setIsTourStep5,
        setIsTourFinished,
        setOnSecondTour,
        setTour2CurrentStep,
        setShowMarketItems,
        getSubscriptionsData,
        orderHistoryProgressUC,
        activeDrawing,
        setActiveDrawingId,
        addedDrawing,
        setAddedDrawing,
        setActiveDrawing,
        activeDrawingId,
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
        isApiKeysLoading,
        state,
        setTwofaSecretKey,
        twofaSecretKey,
        country,
        isCountryAvailable,
        setIsCountryAvailable,
        setCountry,
        setChartDrawings,
        firstLogin,
        chartDrawings,
        settingChartDrawings,
        isSettingChartDrawings,
        createSubscription,
        subscriptionError,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserContextProvider
