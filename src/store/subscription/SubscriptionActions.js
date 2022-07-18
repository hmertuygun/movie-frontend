import subscriptionSlice from './SubscriptionSlice'
import { firebase } from 'services/firebase'
import { getDoubleCollection, getFirestoreDocumentData } from 'services/api'
import dayjs from 'dayjs'
import {
  updateEndTrial,
  updateIsException,
  updateNeedPayment,
  updateShowSubModal,
} from 'store/actions'
import { storage } from 'services/storages'

const {
  setIsCheckingSub,
  setHasSub,
  setSubscriptionData,
  setTrialDaysLeft,
  setIsPaidUser,
  setCreateSubscription,
  setSubscriptionError,
} = subscriptionSlice.actions

const updateIsCheckingSub = (emojis) => async (dispatch) => {
  dispatch(setIsCheckingSub(emojis))
}
const updateHasSub = (value) => async (dispatch) => {
  dispatch(setHasSub(value))
}
const updateSubscriptionData = (value) => async (dispatch) => {
  dispatch(setSubscriptionData(value))
}
const updateTrialDaysLeft = (value) => async (dispatch) => {
  dispatch(setTrialDaysLeft(value))
}
const updateIsPaidUser = (value) => async (dispatch) => {
  dispatch(setIsPaidUser(value))
}
const updateCreateSubscription = (value) => async (dispatch) => {
  dispatch(setCreateSubscription(value))
}
const updateSubscriptionError = (value) => async (dispatch) => {
  dispatch(setSubscriptionError(value))
}
const updateSubscriptionsDetails = (state, userData) => async (dispatch) => {
  dispatch(updateIsCheckingSub(true))
  const subscriptionsDetails = await getFirestoreDocumentData(
    'subscriptions',
    userData?.email
  )

  const subData = subscriptionsDetails.data()
  if (subData && subData.expiration_date && !state.firstLogin) {
    const { subscription_status, provider, currency, plan, amount } = subData
    let errorMessage = subData && subData.error_message
    let scheduledSubs = subData && subData.subscription_scheduled

    dispatch(updateSubscriptionError(errorMessage ? errorMessage : ''))

    const { seconds } = subData.expiration_date
    const exp = dayjs(seconds * 1000)
    const isExpired = exp.isBefore(dayjs())
    if (provider === 'coinbase') {
      dispatch(updateNeedPayment(subscription_status === 'trailing'))
      dispatch(updateHasSub(!isExpired))
      dispatch(updateIsPaidUser(!isExpired))
      dispatch(
        updateCreateSubscription(
          subscription_status === 'cancelled' ||
            subscription_status === 'canceled'
        )
      )
      dispatch(
        updateSubscriptionData({
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
      )
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
      dispatch(updateShowSubModal(showSubModal))
      dispatch(updateTrialDaysLeft(trialDays))
      dispatch(
        updateHasSub(
          (subscription_status === 'trialing' ||
            subscription_status === 'active' ||
            subscription_status === 'canceled' ||
            subscription_status === 'cancelled') &&
            !isExpired
        )
      )
      dispatch(
        updateCreateSubscription(
          subscription_status === 'canceled' ||
            subscription_status === 'cancelled'
        )
      )
      dispatch(updateNeedPayment(subscription_status === 'trialing'))
      if (subData?.payment_method_attached)
        dispatch(updateEndTrial(subData.payment_method_attached))
      dispatch(updateIsPaidUser(subscription_status === 'active'))
      const checkCoupon = await getDoubleCollection(
        'subscriptions',
        'coupons_used',
        userData.email
      )
      dispatch(
        updateSubscriptionData({
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
      )
    }
  } else {
    dispatch(updateNeedPayment(true))
    dispatch(updateHasSub(false))
    dispatch(updateIsPaidUser(false))
    dispatch(updateCreateSubscription(true))
  }

  const exception = await getFirestoreDocumentData('referrals', userData.email)

  if (exception?.data()) {
    dispatch(updateIsException(true))
  }
  dispatch(updateIsCheckingSub(false))
}

export {
  updateIsCheckingSub,
  updateHasSub,
  updateSubscriptionData,
  updateTrialDaysLeft,
  updateIsPaidUser,
  updateCreateSubscription,
  updateSubscriptionError,
  updateSubscriptionsDetails,
}
