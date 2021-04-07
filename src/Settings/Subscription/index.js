import React, { useState, useContext, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { UserContext } from '../../contexts/UserContext'
import { loadStripe } from '@stripe/stripe-js'
import {
  CardElement,
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { buySubscription, createUserSubscription } from '../../api/api'
import {
  errorNotification,
  successNotification,
} from '../../components/Notifications'

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY)

const ELEMENTS_OPTIONS = {
  fonts: [
    {
      cssSrc: 'https://fonts.googleapis.com/css?family=Roboto',
    },
  ],
}

const CARD_OPTIONS = {
  iconStyle: 'solid',
  showIcon: true,
  style: {
    base: {
      iconColor: '#008aff',
      color: '#718096',
      fontWeight: 500,
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      fontSize: '18px',
      lineHeight: '36px',
      fontSmoothing: 'antialiased',
      ':-webkit-autofill': {
        color: '#fce883',
      },
      '::placeholder': {
        color: '#aaa',
      },
    },
    invalid: {
      iconColor: '#f25767',
      color: '#f25767',
    },
  },
}

const CARD_DATA_INITIAL = {
  cardNumber: false,
  cardExpiry: false,
  cardCvc: false,
}

const StripeForm = ({ onCancelClick }) => {
  const stripe = useStripe()
  const elements = useElements()
  const { userData, setHasSub, setSubStatus } = useContext(UserContext)
  const [errors, setError] = useState(null)
  const [cardComplete, setCardComplete] = useState(CARD_DATA_INITIAL)
  const [processing, setProcessing] = useState(false)
  const [isBtnDisabled, setIsBtnDisabled] = useState(true)

  const renderInputValidationError = (errorKey) => (
    <>
      {errors && errors[errorKey] && (
        <div className="text-danger text-left">{errors[errorKey].message}</div>
      )}
    </>
  )

  const onChange = (e) => {
    setError((prev) => ({ ...prev, [e.elementType]: e.error }))
    setCardComplete((prev) => ({ ...prev, [e.elementType]: e.complete }))
  }

  useEffect(() => {
    if (Object.values(cardComplete).every((item) => item === true)) {
      setIsBtnDisabled(false)
    }
  }, [cardComplete])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    if (isBtnDisabled || processing) {
      elements.getElement('cardNumber').focus()
      return
    }

    setProcessing(true)
    try {
      let payload = await createUserSubscription()
      payload = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardNumberElement),
        billing_details: { email: userData?.email },
      })
      await buySubscription(payload.paymentMethod.id)
      setHasSub(true)
      setSubStatus("active")
      successNotification.open({ description: 'Subscription Added!' })
    } catch (e) {
      console.error(e)
      errorNotification.open({
        description: 'Transaction failed. Please try again later!',
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-8 mx-auto">
          {/* <div className="logo d-flex justify-content-center">
            <img src="./img/brand/stripe-logo.png" width="175" />
          </div> */}
          <div className={`form-group ${processing ? 'disable-element' : ''}`}>
            <div style={{ borderBottom: '1px solid #aaa' }}>
              <label className="text-bold">Card Number</label>
              <CardNumberElement
                options={{
                  ...CARD_OPTIONS,
                  placeholder: 'e.g: 4242 4242 4242 4242',
                }}
                onChange={onChange}
              />
            </div>
            {renderInputValidationError('cardNumber')}
          </div>
          <div className={`form-group ${processing ? 'disable-element' : ''}`}>
            <div style={{ borderBottom: '1px solid #aaa' }}>
              <label className="text-bold">Expiry Date</label>
              <CardExpiryElement
                options={{ ...CARD_OPTIONS, placeholder: 'e.g: 12/22' }}
                onChange={onChange}
              />
            </div>
            {renderInputValidationError('cardExpiry')}
          </div>
          <div className={`form-group ${processing ? 'disable-element' : ''}`}>
            <div style={{ borderBottom: '1px solid #aaa' }}>
              <label className="text-bold">CVC Number</label>
              <CardCvcElement
                options={{ ...CARD_OPTIONS, placeholder: 'e.g: 123' }}
                onChange={onChange}
              />
            </div>
            {renderInputValidationError('cardCvc')}
          </div>
          <div className="row mt-5">
            <div className="col-md-12 text-center">
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={processing}
              >
                {processing ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <span>Pay $29</span>
                )}
              </button>
              <button
                type="button"
                disabled={processing}
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onCancelClick(false)
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

const UserSubscriptions = () => {
  const [showStripeForm, setShowStripeForm] = useState(false)
  const { hasSub, subStatus } = useContext(UserContext)
  const trialEnded = ['incomplete', 'incomplete_expired']
  const subExpired = ['canceled', 'unpaid', 'past_due']
  const subActive = ['active', 'trialing']
  const statusMsg = trialEnded.includes(subStatus)
    ? 'Your free trial ended. '
    : subExpired
      ? 'Your subscription expired.'
      : ''
  const subCard = subActive.includes(subStatus) ? (
    <>
      <span className="avatar bg-success text-white rounded-circle mr-3">
        <FontAwesomeIcon icon="check" color="#ffffff" size="2x" />
      </span>
      <div className="media-body">
        <h5 className="mb-0">
          {subStatus === 'active'
            ? 'Subscription active!'
            : 'Trial period active!'}
        </h5>
        <p className="text-muted lh-150 text-sm mb-0">
          {subStatus === 'active'
            ? 'Will Auto renew at $29 / month'
            : 'Trial will end on'}
        </p>
      </div>
    </>
  ) : trialEnded.includes(subStatus) ? (
    <>
      <span className="avatar bg-warning text-white rounded-circle mr-3">
        <FontAwesomeIcon icon="exclamation" color="#ffffff" size="2x" />
      </span>
      <div className="media-body">
        <h5 className="mb-0">Your free trial has ended.</h5>
        <p className="text-muted lh-150 text-sm mb-0">
          Your 14 day trial period is over! Click on Manage button to add
          subscription.
        </p>
      </div>
    </>
  ) : subExpired.includes(subStatus) ? (
    <>
      <span className="avatar bg-danger text-white rounded-circle mr-3">
        <FontAwesomeIcon icon="exclamation" color="#ffffff" size="2x" />
      </span>
      <div className="media-body">
        <h5 className="mb-0">Your subscription has expired!</h5>
        <p className="text-muted lh-150 text-sm mb-0">
          Click on Manage button to add subscription.
        </p>
      </div>
    </>
  ) : (
    <>
      <span className="avatar bg-danger text-white rounded-circle mr-3">
        <FontAwesomeIcon icon="exclamation" color="#ffffff" size="2x" />
      </span>
      <div className="media-body">
        <h5 className="mb-0">Your subscription has expired!</h5>
        <p className="text-muted lh-150 text-sm mb-0">
          Click on Manage button to add subscription.
        </p>
      </div>
    </>
  )

  return (
    <section className="slice slice-sm bg-section-secondary">
      <div className="card">
        <div className="card-body">
          <div className="row row-grid align-items-center">
            <div className="col-md-10">
              <div className="media align-items-center">{subCard}</div>
            </div>
            <div className="col-md-2 text-md-right">
              <button
                type="button"
                className={`btn btn-sm rounded-pill ${subStatus === "active" ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => setShowStripeForm(true)}
              >
                {subStatus === "active" ? 'Delete' : 'Manage'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {subStatus !== "active" ? <div
        className={`card card-fluid ${showStripeForm ? 'd-block' : 'd-none'}`}
      >
        <div className="card-body">
          <Elements stripe={stripePromise} options={ELEMENTS_OPTIONS}>
            <StripeForm
              onCancelClick={(e) => {
                setShowStripeForm(e)
              }}
            />
          </Elements>
        </div>
      </div> : null
      }
    </section>
  )
}

export default UserSubscriptions
