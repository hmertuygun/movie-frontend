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
  handleCountry,
  findFastServer,
  handleFirstLogin,
  updateCanaryUser,
} from 'store/actions'
import { useDispatch, useSelector } from 'react-redux'
import { URLS } from 'constants/config'
export const UserContext = createContext()

const UserContextProvider = ({ children }) => {
  storage.remove('tradingview.IntervalWidget.quicks')

  const { userData, userState } = useSelector((state) => state.users)
  const { totalExchanges } = useSelector((state) => state.exchanges)
  const { isOnboardingSkipped, country, isCountryAvailable } = useSelector(
    (state) => state.appFlow
  )
  const dispatch = useDispatch()

  useEffect(() => {
    const onboarding = storage.get('onboarding')
    storage.set('proxyServer', URLS[0])
    dispatch(getUserExchangesAfterFBInit(userData, isOnboardingSkipped))
    dispatch(getProducts())
    dispatch(findFastServer(URLS))
    dispatch(updateIsOnboardingSkipped(onboarding === 'skipped'))
  }, [])

  useEffect(() => {
    if (userData.email) {
      if (!country) {
        dispatch(handleCountry(userData.email, userState))
      }
      dispatch(fetchAnalysts(userData))
    }
  }, [country, isCountryAvailable, userData])

  useEffect(() => {
    if (userData) {
      dispatch(updateSubscriptionsDetails(userState, userData))
      dispatch(handleFirstLogin(userData.email, userState))
      dispatch(updateCanaryUser())
    }
  }, [userData])

  useEffect(() => {
    if (isOnboardingSkipped) {
      dispatch(initExchanges(userData, isOnboardingSkipped))
    }
  }, [isOnboardingSkipped])

  useEffect(() => {
    dispatch(initExchanges(userData, isOnboardingSkipped))
  }, [userData.email])

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
