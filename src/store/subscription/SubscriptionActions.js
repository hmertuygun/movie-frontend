import {
  fetchCouponUsed,
  fetchStripePlans,
  fetchSubscriptions,
} from 'services/api'
import dayjs from 'dayjs'
import {
  updateEndTrial,
  updateIsException,
  updateNeedPayment,
  updateShowSubModal,
  getReferrals,
} from 'store/actions'
import { storage } from 'services/storages'

import {
  setIsCheckingSub,
  setHasSub,
  setSubscriptionData,
  setTrialDaysLeft,
  setIsPaidUser,
  setCreateSubscription,
  setSubscriptionError,
} from './SubscriptionSlice'
import { createAsyncThunk } from '@reduxjs/toolkit'

const updateIsCheckingSub = (value) => async (dispatch) => {
  dispatch(setIsCheckingSub(value))
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
const getSubscription = createAsyncThunk(
  'subscription/getSubscription',
  async () => {
    return await fetchSubscriptions()
  }
)

const getCouponsUsed = createAsyncThunk(
  'subscription/getCouponsUsed',
  async () => {
    return await fetchCouponUsed()
  }
)

const getStripeplans = createAsyncThunk('stripe/getStripePlans', async () => {
  return await fetchStripePlans()
})

const updateSubscriptionsDetails = (firstLogin) => async (dispatch) => {
  dispatch(updateIsCheckingSub(true))
  const subscriptionsDetails = await dispatch(getSubscription())
  const subData = subscriptionsDetails?.payload.data.data
  if (subData && subData.expiration_date && !firstLogin) {
    const { subscription_status, provider, currency, plan, amount } = subData
    let errorMessage = subData && subData.error_message
    let scheduledSubs = subData && subData.subscription_scheduled

    dispatch(updateSubscriptionError(errorMessage ? errorMessage : ''))

    const { expiration_date } = subData
    const exp = dayjs(expiration_date * 1000)
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
          due: expiration_date,
          priceData: {
            currency,
            unit_amount: amount,
            interval: plan,
          },
        })
      )
    } else if (provider === 'stripe' || provider === 'coinpanel') {
      let trialDays = expiration_date - Date.now()
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
      let coupons = await dispatch(getCouponsUsed())
      coupons = coupons?.payload.data

      dispatch(
        updateSubscriptionData({
          subscription: {
            type: 'stripe',
            status: subscription_status,
          },
          due: expiration_date,
          couponUsed: coupons.length > 0,
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

  const exception = await dispatch(getReferrals())
  if (exception?.payload.data) {
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
  getSubscription,
  getStripeplans,
}
