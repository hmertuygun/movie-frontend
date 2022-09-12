import React, { createContext, useEffect } from 'react'
import { storage, session } from 'services/storages'
import {
  updateExchanges,
  updateIsOnboardingSkipped,
  updateSubscriptionsDetails,
  initExchanges,
  getUserExchangesAfterFBInit,
  getProducts,
  fetchAnalysts,
  findFastServer,
  updateCanaryUser,
  getUserData,
} from 'store/actions'
import { useDispatch, useSelector } from 'react-redux'
import { URLS } from 'constants/config'

export const UserContext = createContext()

const UserContextProvider = ({ children }) => {
  storage.remove('tradingview.IntervalWidget.quicks')

  const { userData, userState, country, isCountryAvailable, firstLogin } =
    useSelector((state) => state.users)
  const { totalExchanges } = useSelector((state) => state.exchanges)
  const { isOnboardingSkipped } = useSelector((state) => state.appFlow)
  const dispatch = useDispatch()

  useEffect(() => {
    const onboarding = storage.get('onboarding')
    storage.set('proxyServer', URLS[0])
    dispatch(findFastServer(URLS))
    dispatch(updateIsOnboardingSkipped(onboarding === 'skipped'))
  }, [])

  useEffect(() => {
    if (userData.email) {
      if (!country) {
        dispatch(getUserData())
      }
      dispatch(fetchAnalysts(userData))
    }
  }, [country, isCountryAvailable, userData])

  useEffect(() => {
    if (!totalExchanges || !totalExchanges.length) return
    let mapExchanges = totalExchanges.map((item) => ({
      ...item,
      label: `${item.exchange} - ${item.apiKeyName}`,
      value: `${item.exchange} - ${item.apiKeyName}`,
    }))
    dispatch(updateExchanges(mapExchanges))
  }, [totalExchanges])

  const isLoggedIn =
    userState &&
    userState.user &&
    (!userState.has2FADetails || userState.is2FAVerified)
  const isLoggedInWithFirebase = userState && userState.user

  useEffect(() => {
    if (userData && isLoggedIn) {
      dispatch(updateSubscriptionsDetails(firstLogin))
      dispatch(getUserData())
      dispatch(updateCanaryUser())
    }
  }, [userData, firstLogin, isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      if (userData.email) dispatch(initExchanges(userData, isOnboardingSkipped))
    }
  }, [userData.email, isOnboardingSkipped, isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(getUserExchangesAfterFBInit(userData, isOnboardingSkipped))
      dispatch(getProducts())
    }
  }, [isLoggedIn])

  if (isLoggedIn) session.set('remember', true)
  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        isLoggedInWithFirebase,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserContextProvider
