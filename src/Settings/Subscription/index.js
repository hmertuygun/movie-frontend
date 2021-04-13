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
import { buySubscription, createUserSubscription, deleteSubscription } from '../../api/api'
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

const StripeForm = ({ onCancelClick, hideStripeForm }) => {
  const stripe = useStripe()
  const elements = useElements()
  const { userData, setHasSub, setSubInfo } = useContext(UserContext)
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
      const payload = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardNumberElement),
        billing_details: { email: userData?.email },
      })
      const response = await buySubscription(payload.paymentMethod.id)
      setHasSub(new Date(response.current_period_end) > new Date())
      setSubInfo({ ...response })
      hideStripeForm()
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
  const { hasSub, subInfo, setSubInfo, setHasSub, userData } = useContext(UserContext)
  const trialEnded = ['incomplete', 'incomplete_expired']
  const subExpired = ['canceled', 'unpaid', 'past_due']
  const subActive = ['active', 'trialing']
  const [subStatus, setSubStatus] = useState("")
  const [subDate, setSubDate] = useState("")
  const [statusMsg, setStatusMsg] = useState("")
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  useEffect(() => {
    if (!subInfo) return
    if (subInfo?.status) setSubStatus(subInfo.status)
    if (subInfo?.current_period_end) {
      let wholeDate = new Date(subInfo.current_period_end)
      wholeDate = `${month[wholeDate.getMonth()]} ${dateFormat(wholeDate.getDate())}, ${wholeDate.getFullYear()}`
      setSubDate(wholeDate)
    }
    setHasPaymentMethod(subInfo.payment_method !== null)
    if (subActive.includes(subInfo.status) && subInfo.payment_method) setStatusMsg('Pro Account | $29/month')
    else if (subInfo.status === "trialing" && !subInfo.payment_method) setStatusMsg('Trial period active')
    else if (subExpired.includes(subInfo.status) || trialEnded.includes(subInfo.status)) setStatusMsg('Subscription Inactive!')
  }, [subInfo])

  const dateFormat = (val) => {
    if (val === 1) return '1st'
    else if (val === 2) return '2nd'
    else if (val === 3) return '3rd'
    else return `${val}th`
  }

  const deleteSub = async () => {
    try {
      setDeleting(true)
      const resp = await deleteSubscription()
      successNotification.open({ description: 'Payment method deleted!' })
      setSubInfo(resp)
      if (new Date(resp.current_period_end) > new Date()) setHasSub(true)
      else setHasSub(false)
    }
    catch (e) {
      console.log(e)
      errorNotification.open({ description: `Couldn't delete subscription. Please try again later!` })
    }
    finally {
      setDeleting(false)
    }
  }

  const subCard = (
    <>
      <span className="avatar bg-danger text-white rounded-circle mr-3">
        <i className="far fa-bell" />
      </span>
      <div className="media-body">
        <h5 className="mb-0">
          {statusMsg}
        </h5>
        <p className="text-muted lh-150 text-sm mb-0">
          Email: {userData.email}
        </p>
        <p className="text-muted lh-150 text-sm mb-0">
          {hasPaymentMethod ? `Your subscription will auto-renew on ${subDate}` : `No payment method found. Please click on 'Manage' button to add a valid payment method.`}
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
              {
                hasPaymentMethod ? (
                  <button
                    type="button"
                    className={`btn btn-sm btn-danger btn-icon rounded-pill ${hasPaymentMethod ? 'd-block' : 'd-none'}`}
                    onClick={deleteSub}
                  >
                    {deleting ? <span className="spinner-border spinner-border-sm" /> : 'Delete'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill btn-neutral`}
                    onClick={() => setShowStripeForm(true)}
                  >
                    Manage
                  </button>
                )
              }
            </div>
          </div>
        </div>
      </div>
      {showStripeForm ? (
        <div
          className={`card card-fluid`}
        >
          <div className="card-body">
            <Elements stripe={stripePromise} options={ELEMENTS_OPTIONS}>
              <StripeForm
                onCancelClick={(e) => {
                  setShowStripeForm(e)
                }}
                hideStripeForm={() => setShowStripeForm(false)}
              />
            </Elements>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default UserSubscriptions
