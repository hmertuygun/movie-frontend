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
  checkSubscription,
  createUserSubscription,
} from '../api/api'
import { successNotification } from '../components/Notifications'
import capitalize from '../helpers/capitalizeFirstLetter'
import { ref } from 'yup'
export const UserContext = createContext()
const T2FA_LOCAL_STORAGE = '2faUserDetails'

const UserContextProvider = ({ children }) => {
  const localStorageUser = localStorage.getItem('user')
  const localStorageRemember = localStorage.getItem('remember')
  const sessionStorageRemember = sessionStorage.getItem('remember')
  const localStorage2faUserDetails = localStorage.getItem(T2FA_LOCAL_STORAGE)
  localStorage.removeItem('tradingview.IntervalWidget.quicks')
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
  const [userData, setUserData] = useState(false)
  const [userContextLoaded, setUserContextLoaded] = useState(false)
  const [totalExchanges, setTotalExchanges] = useState([])
  const [activeExchange, setActiveExchange] = useState({
    apiKeyName: '',
    exchange: '',
  })
  const [loaderText, setLoaderText] = useState(
    'Loading data from new exchange ...'
  )
  const [loaderVisible, setLoaderVisibility] = useState(false)
  const [rememberCheck, setRememberCheck] = useState(false)
  const [isCheckingSub, setIsCheckingSub] = useState(false)
  const [hasSub, setHasSub] = useState(true)
  const [needPayment, setNeedPayment] = useState(false)
  const [products, setProducts] = useState([])
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [subInfo, setSubInfo] = useState(null)
  const [openOrdersUC, setOpenOrdersUC] = useState([])
  const [delOpenOrders, setDelOpenOrders] = useState(null)
  const [orderHistoryProgressUC, setOrderHistoryProgressUC] = useState('100.00')

  useEffect(() => {
    getUserExchangesAfterFBInit()
    getProducts()
  }, [])

  const getProducts = async () => {
    const db = firebase.firestore()
    const plans = []
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

  useEffect(() => {
    if (userData) {
      const db = firebase.firestore()
      const currentUser = firebase.auth().currentUser

      const getCustomClaimRole = async () => {
        await currentUser.getIdToken(true)
        const decodedToken = await currentUser.getIdTokenResult()
        return decodedToken.claims.stripeRole
      }

      const getSubscriptionsData = async () => {
        setIsCheckingSub(true)
        try {
          const response = await db
            .collection('stripe_users')
            .doc(currentUser.uid)
            .collection('subscriptions')
            .orderBy('created', 'asc')
            .get()

          const all = await Promise.all(
            response.docs.map(async (doc) => {
              const subscriptionData = doc.data()
              const response = await db
                .collection('stripe_users')
                .doc(currentUser.uid)
                .collection('subscriptions')
                .doc(doc.id)
                .collection('invoices')
                .get()
              const invoices = response.docs.map((doc) => doc.data())
              return {
                ...subscriptionData,
                invoices,
              }
            })
          )
          console.log('==>', all)
          if (all.length === 0) return
          const activeSubscriptions = all.filter(
            (sub) => sub.status === 'active'
          )
          const trialingSubscriptions = all.filter(
            (sub) => sub.status === 'trialing'
          )
          const canceledSubscriptions = all.filter(
            (sub) => sub.status === 'canceled'
          )
          const pastDueSubscriptions = all.filter(
            (sub) => sub.status === 'past_due'
          )
          const lastSubscription = all[all.length - 1]
          console.log('last ==>', lastSubscription)

          const neverPaid = !lastSubscription.invoices.some(
            (invoice) => invoice.amount_paid > 0
          )
          const NoneActive = !all.some((sub) => sub.status === 'active')
          
          const stripeUser = await db.collection('stripe_users')
          .doc(currentUser.uid).get()
          const NoDefaultPayment = !stripeUser.data()?.payment_method_added_ever
          // const NoDefaultPayment = !lastSubscription.invoices.some(
          //   (invoice) => invoice.default_payment_method
          // )

          // Add Payment Method case
          if (
            (lastSubscription.status === 'active' &&
              lastSubscription.trial_end?.seconds + 86400 > new Date() / 1000 &&
              neverPaid) ||
            (lastSubscription.status === 'trialing' && NoDefaultPayment) ||
            lastSubscription.status === 'past_due'
          ) {
            setNeedPayment(true)
            console.log('==> need payment')
          } else {
            setNeedPayment(false)
          }

          // Subscribe button case
          if (lastSubscription.status === 'canceled' && NoneActive) {
            setHasSub(false)
          }

          // Manage subscription case
          if (
            (lastSubscription.status === 'active' &&
              lastSubscription.trial_end?.seconds + 86400 <
                new Date() / 1000) ||
            ((lastSubscription.status === 'active' ||
              lastSubscription.status === 'trialing') &&
              lastSubscription.trial_end?.seconds + 86400 > new Date() / 1000 &&
              !NoDefaultPayment)
          ) {
            console.log('has sub ==> true')
            setHasSub(true)
          }
          const priceData = (await lastSubscription.price.get()).data()
          const plan = await getCustomClaimRole()
          console.log(
            'sub, priceData, plan ==>',
            lastSubscription,
            priceData,
            plan
          )
          setSubscriptionData({
            subscription: lastSubscription,
            priceData,
            plan,
          })
          setIsCheckingSub(false)
        } catch (error) {
          console.log('==>', error)
        }
      }

      getSubscriptionsData()
    }
  }, [userData])

  async function getExchanges() {
    try {
      const hasKeys = await getUserExchanges()
      if (!hasKeys?.data?.apiKeys?.length) {
        setUserContextLoaded(true)
        return
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
        setLoadApiKeys(true)
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
          setLoadApiKeys(true) // Only check active api exchange eventually
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
            setLoadApiKeys(true)
          }
        }
      }
    } catch (e) {
      console.log(e)
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
        console.log(`Received msg in UC onMessage`)
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
      navigator.serviceWorker.addEventListener('message', (message) => {
        console.log(`Received msg in UC serviceWorker.addEventListener`)
      })
    } catch (e) {
      console.log(e)
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
        localStorage.clear()
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
        setUserData,
        rememberCheck,
        setRememberCheck,
        devENV,
        isCheckingSub,
        hasSub,
        needPayment,
        products,
        subscriptionData,
        subInfo,
        setSubInfo,
        setHasSub,
        orderHistoryProgressUC,
        setOrderHistoryProgressUC,
        openOrdersUC,
        setOpenOrdersUC,
        delOpenOrders,
        setDelOpenOrders,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserContextProvider
