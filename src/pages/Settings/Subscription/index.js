import React, { useContext, useState, useMemo, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { notify } from 'reapop'
import SubscriptionActiveCard from './SubscriptionActiveCard'
import { UserContext } from 'contexts/UserContext'
import { UserCheck, AlertTriangle } from 'react-feather'
import {
  finishSubscriptionByUser,
  getDefaultPaymentMethod,
  getStripeClientSecret,
} from 'services/api'
import Select from 'react-select'
import countryList from 'react-select-country-list'
import { HelpCircle } from 'react-feather'
import Plans from 'pages/Auth/Plans'
import './index.css'
import { EndTrialModal, CountrySelectionModal } from './Modals'
import { useDispatch, useSelector } from 'react-redux'
import {
  getSubscription,
  saveUserData,
  updateCountry,
  updateIsCountryAvailable,
  updateIsPaidUser,
  updateSubscriptionData,
  updateSubscriptionsDetails,
} from 'store/actions'
import { consoleLogger } from 'utils/logger'
import MESSAGES from 'constants/Messages'
import { getNumberOfTimeLeft } from 'utils/getNumberOfTimeLeft'

const Subscription = () => {
  const { logout } = useContext(UserContext)
  const { isSubOpen, country, firstLogin } = useSelector((state) => state.users)
  const { products } = useSelector((state) => state.market)
  const { endTrial, needPayment } = useSelector((state) => state.appFlow)
  const { isCheckingSub, hasSub, subscriptionData, subscriptionError } =
    useSelector((state) => state.subscriptions)
  const history = useHistory()
  const dispatch = useDispatch()
  const [showEndTrialModal, setShowEndTrialModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const options = useMemo(() => countryList().getData(), [])
  const [showCountryModal, setShowCountryModal] = useState(false)
  const [countrySelectionLoading, setCountrySelectionLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [cardInfo, setCardInfo] = useState(false)
  const [clientSecret, setClientSecret] = useState(false)
  const [subscriptionCreds, setSubscriptionCreds] = useState(false)

  useEffect(() => {
    getClientSecret()
  }, [])

  const handleCountrySelection = async (value) => {
    dispatch(updateCountry(value))
    setShowCountryModal(true)
  }

  const getClientSecret = async () => {
    try {
      setCardInfo(null)
      let subData = await dispatch(getSubscription())
      subData = subData?.payload.data.data
      const { customer_id, subscription_id } = subData
      const [subscriptionId, stripeId] = [subscription_id, customer_id]
      setSubscriptionCreds({ stripeId, subscriptionId })
      if (stripeId && subscriptionId) {
        const res = await getStripeClientSecret({ stripeId, subscriptionId })
        setClientSecret({ clientSecret: res })
      }
      const defaultPaymentRes = await getDefaultPaymentMethod({ stripeId })
      if (defaultPaymentRes) {
        setCardInfo(defaultPaymentRes.card)
      }
    } catch (error) {
      dispatch(notify(MESSAGES['something-wrong'], 'error'))
    }
  }

  const handleClickConfirm = async () => {
    setCountrySelectionLoading(true)
    try {
      await dispatch(saveUserData({ country }))
      dispatch(updateIsCountryAvailable(true))
    } catch (err) {
      consoleLogger(err)
    } finally {
      setCountrySelectionLoading(false)
    }
    setShowCountryModal(false)
  }

  const handleClickNo = () => {
    setShowCountryModal(false)
    dispatch(updateCountry(''))
  }

  const handleClickYes = async () => {
    setIsLoading(true)
    try {
      await finishSubscriptionByUser()
      await dispatch(updateSubscriptionsDetails(firstLogin))
      history.push('/trade')
      setIsLoading(false)
      setShowEndTrialModal(false)
      dispatch(updateIsPaidUser(true))
      if (subscriptionData) {
        let values = {
          ...subscriptionData,
          subscription: { ...subscriptionData.subscription, status: 'active' },
        }
        dispatch(updateSubscriptionData(values))
      }
    } catch (err) {
      setIsLoading(false)
      setShowEndTrialModal(false)
      dispatch(notify(MESSAGES['end-trial-failed'], 'error'))
    }
  }

  let subscriptionStatus = useMemo(
    () => subscriptionData?.subscription?.status,
    [subscriptionData]
  )

  if (!isSubOpen) {
    return (
      <div className="alert alert-warning shadow-lg mt-4" role="alert">
        <strong>
          {' '}
          Sorry for the inconvenience. Our subscription system is under
          maintenance, please check later.
        </strong>
      </div>
    )
  }

  return (
    <div className="row pt-5">
      <div className="col-lg-6">
        <div className="form-group custom-label-container">
          <label className="form-control-label">Country of Residency</label>{' '}
          <HelpCircle
            size={18}
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
          />
          {showInfo && (
            <div className="tab-info">
              <p className="mb-2">
                CoinPanel only asks for country of residence for internal
                accounting purposes and applies VAT rate applicable in
                respective country.
              </p>
              <p className="mb-2">
                We take all steps necessary to ensure that your personal data is
                treated securely and will not be shared to any third parties.
              </p>
              <p className="mb-2">
                This will not affect accessibility and trading functions.
              </p>
            </div>
          )}
          <Select
            options={options}
            value={country}
            isDisabled={country && !!country.value}
            onChange={handleCountrySelection}
            className="input-group-merge country-border"
          />
        </div>
      </div>
      <div className="col-lg-12">
        {subscriptionError && (
          <div className="alert alert-danger" role="alert">
            <AlertTriangle size={24} strokeWidth={3} />
            <span className="ml-3 mt-2" style={{ fontSize: 18 }}>
              {subscriptionError}
            </span>
          </div>
        )}
        {subscriptionStatus === 'trialing' ? (
          <div className="card card-pricing shadow px-3 py-3">
            <h3>Trial</h3>
            <p className="mb-0 text-medium">
              You are in trial now, you have{' '}
              {subscriptionData
                ? getNumberOfTimeLeft(subscriptionData?.due)
                : ''}{' '}
              left to use CoinPanel for free.
            </p>
          </div>
        ) : null}
        {!isCheckingSub ? (
          hasSub && subscriptionStatus !== 'trialing' ? (
            <SubscriptionActiveCard
              creds={clientSecret}
              subscriptionData={subscriptionData}
              needPayment={needPayment}
              card={cardInfo}
              subCreds={subscriptionCreds}
              logout={logout}
              products={products}
              getClientSecret={getClientSecret}
            />
          ) : (
            <Plans />
          )
        ) : null}
        <>
          {subscriptionStatus === 'trialing' && endTrial ? (
            <div className="card shadow-lg border-0" style={{ width: '100%' }}>
              <div className="card-body px-5 py-5 text-center text-md-left">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <h5 className="mb-2">
                      Do you want to end your trial in CoinPanel?
                    </h5>
                    <p className="mb-0">
                      You will be able to use paid features.
                    </p>
                  </div>
                  <div className="col-12 col-md-6 mt-4 mt-md-0 text-md-right">
                    <a
                      href="#"
                      className="btn btn-warning btn-icon rounded-pill"
                      onClick={() => setShowEndTrialModal(true)}
                    >
                      <span className="btn-inner--icon">
                        <UserCheck />
                      </span>
                      <span className="btn-inner--text">Click Here</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
        {showEndTrialModal && (
          <EndTrialModal
            handleClickCancel={() => setShowEndTrialModal(false)}
            handleClickYes={handleClickYes}
            isLoading={isLoading}
          />
        )}
        {showCountryModal && (
          <CountrySelectionModal
            handleClickCancel={handleClickNo}
            handleClickConfirm={handleClickConfirm}
            isloading={countrySelectionLoading}
          />
        )}
      </div>
    </div>
  )
}

export default Subscription
