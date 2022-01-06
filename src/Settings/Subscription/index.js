import React, { useContext, useState, useMemo, useEffect } from 'react'
import { useHistory } from 'react-router-dom'

import SubscriptionCard from './SubscriptionCard'
import SubscriptionActiveCard from './SubscriptionActiveCard'
import { UserContext } from '../../contexts/UserContext'
import { UserCheck } from 'react-feather'
import { Modal } from '../../components'
import { firebase } from '../../firebase/firebase'
import { getSubscriptionDetails } from '../../api/api'
import { errorNotification } from '../../components/Notifications'
import Select from 'react-select'
import countryList from 'react-select-country-list'
import './index.css'

const Subscription = () => {
  const {
    isCheckingSub,
    hasSub,
    needPayment,
    products,
    subscriptionData,
    getSubscriptionsData,
    setSubscriptionData,
    setIsPaidUser,
    endTrial,
    userData,
    setCountry,
    country,
  } = useContext(UserContext)
  const history = useHistory()
  const [showEndTrialModal, setShowEndTrialModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const options = useMemo(() => countryList().getData(), [])

  const handleCountrySelection = async (value) => {
    setCountry(value)
    await firebase
      .firestore()
      .collection('user_data')
      .doc(userData.email)
      .set({ country: value }, { merge: true })
  }

  const handleClickYes = async () => {
    setIsLoading(true)
    try {
      await getSubscriptionDetails()
      await getSubscriptionsData()
      history.push('/trade')
      setIsLoading(false)
      setShowEndTrialModal(false)
      setIsPaidUser(true)
      let values = {
        ...subscriptionData,
        subscription: { ...subscriptionData.subscription, status: 'active' },
      }
      setSubscriptionData(values)
    } catch (err) {
      setIsLoading(false)
      setShowEndTrialModal(false)
      errorNotification.open({
        description: `Cannot end trial. Please contact support`,
      })
    }
  }

  let subscriptionStatus = subscriptionData?.subscription?.status

  return (
    <div className="row pt-5">
      <div className="col-lg-6">
        <div className="form-group">
          <label className="form-control-label">Country</label>
          <Select
            options={options}
            value={country}
            isDisabled={!!country.value}
            onChange={handleCountrySelection}
            className="input-group-merge country-border"
          />
        </div>
      </div>
      <div className="col-lg-12">
        {!isCheckingSub ? (
          hasSub ? (
            <SubscriptionActiveCard
              subscriptionData={subscriptionData}
              needPayment={needPayment}
            />
          ) : (
            products.map((product) => (
              <SubscriptionCard product={product} key={product.id} />
            ))
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
          <Modal>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="pt-5 text-center">
                    <div className="icon text-warning custom-icon-container">
                      <UserCheck size={16} strokeWidth={3} />
                    </div>
                    <h4 className="h5 mt-5 mb-3">Extremely important</h4>
                    <p>
                      You will be ended your trial and paid features will be
                      activated for your account. Are you sure?
                    </p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    onClick={handleClickYes}
                    type="button"
                    className="btn btn-sm btn-link text-warning btn-zoom--hover font-weight-600"
                  >
                    {isLoading ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : (
                      'Yes'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm "
                    onClick={() => setShowEndTrialModal(false)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}

export default Subscription
