import { storage } from 'services/storages'
import { firebase } from 'services/firebase'
import { getSocketEndpoint } from 'services/exchanges'
import Ping from 'utils/ping'
import {
  setIsOnboardingSkipped,
  setRememberCheck,
  setLoaderVisible,
  setOnTour,
  setIsTourStep5,
  setIsTourFinished,
  setOnSecondTour,
  setTour2CurrentStep,
  setTwofaSecretKey,
  setEndTrial,
  setNeedPayment,
  setShowSubModal,
  setChartNeedsThemeUpdate,
  setShowThemeWarning,
} from './AppFlowSlice'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { fetchPlatformMessages, fetchUserNotices } from 'services/api'

const p = new Ping({ favicon: '' })

const updateIsOnboardingSkipped = (value) => async (dispatch) => {
  dispatch(setIsOnboardingSkipped(value))
}

const updateRememberCheck = (value) => async (dispatch) => {
  dispatch(setRememberCheck(value))
}
const updateLoaderVisible = (value) => async (dispatch) => {
  dispatch(setLoaderVisible(value))
}
const updateOnTour = (value) => async (dispatch) => {
  dispatch(setOnTour(value))
}
const updateIsTourStep5 = (value) => async (dispatch) => {
  dispatch(setIsTourStep5(value))
}
const updateIsTourFinished = (value) => async (dispatch) => {
  dispatch(setIsTourFinished(value))
}
const updateOnSecondTour = (value) => async (dispatch) => {
  dispatch(setOnSecondTour(value))
}
const updateTour2CurrentStep = (value) => async (dispatch) => {
  dispatch(setTour2CurrentStep(value))
}
const updateTwofaSecretKey = (value) => async (dispatch) => {
  dispatch(setTwofaSecretKey(value))
}
const updateEndTrial = (value) => async (dispatch) => {
  dispatch(setEndTrial(value))
}
const updateNeedPayment = (value) => async (dispatch) => {
  dispatch(setNeedPayment(value))
}
const updateShowSubModal = (value) => async (dispatch) => {
  dispatch(setShowSubModal(value))
}
const handleOnboardingSkip = () => async (dispatch) => {
  storage.set('onboarding', 'skipped')
  dispatch(updateIsOnboardingSkipped(true))
}
const handleOnboardingShow = () => async (dispatch) => {
  storage.remove('onboarding')
  dispatch(updateIsOnboardingSkipped(false))
}
const updateSetShowThemeWarning = (value) => async (dispatch) => {
  dispatch(setShowThemeWarning(value))
}
const updateSetChartNeedsThemeUpdate = (value) => async (dispatch) => {
  dispatch(setChartNeedsThemeUpdate(value))
}

const sendEmailAgain = (userState) => async (dispatch) => {
  if (userState.registered) {
    const actionCodeSettings = {
      url:
        window.location.origin + '?email=' + firebase.auth().currentUser.email,
      handleCodeInApp: true,
    }

    firebase.auth().currentUser.sendEmailVerification(actionCodeSettings)
  } else {
    console.log('no registered')
  }
}

const makePing = async (url) => {
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

const findFastServer = (urls) => async (dispatch) => {
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

const getPlatformMessages = createAsyncThunk(
  'messages/getPlatformMessages',
  async () => {
    return await fetchPlatformMessages()
  }
)

const getUserNotices = createAsyncThunk('user/noticeList', async () => {
  return await fetchUserNotices()
})

export {
  updateIsOnboardingSkipped,
  updateRememberCheck,
  updateLoaderVisible,
  updateOnTour,
  updateIsTourStep5,
  updateIsTourFinished,
  updateOnSecondTour,
  updateTour2CurrentStep,
  updateTwofaSecretKey,
  updateEndTrial,
  updateNeedPayment,
  updateShowSubModal,
  handleOnboardingSkip,
  handleOnboardingShow,
  sendEmailAgain,
  findFastServer,
  updateSetShowThemeWarning,
  updateSetChartNeedsThemeUpdate,
  getPlatformMessages,
  getUserNotices,
}
