import React, { useState, useContext, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { UserContext } from '../../contexts/UserContext'
import { loadStripe } from "@stripe/stripe-js"
import {
  CardElement,
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  Elements,
  useElements,
  useStripe
} from "@stripe/react-stripe-js"

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY)

const ELEMENTS_OPTIONS = {
  fonts: [
    {
      cssSrc: "https://fonts.googleapis.com/css?family=Roboto"
    }
  ]
}

const CARD_OPTIONS = {
  iconStyle: "solid",
  showIcon: true,
  style: {
    base: {
      iconColor: "#008aff",
      color: "#718096",
      fontWeight: 500,
      fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
      fontSize: "18px",
      lineHeight: '36px',
      fontSmoothing: "antialiased",
      ":-webkit-autofill": {
        color: "#fce883"
      },
      "::placeholder": {
        color: "#aaa",
      }
    },
    invalid: {
      iconColor: "#f25767",
      color: "#f25767"
    }
  }
}

const CARD_DATA_INITIAL = {
  cardNumber: false,
  cardExpiry: false,
  cardCvc: false
}

const StripeForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const { userData, hasSub, setHasSub } = useContext(UserContext)
  const [errors, setError] = useState(null)
  const [cardComplete, setCardComplete] = useState(CARD_DATA_INITIAL)
  const [processing, setProcessing] = useState(false)
  const [isBtnDisabled, setIsBtnDisabled] = useState(true)

  const renderInputValidationError = (errorKey) => (
    <>
      { errors && errors[errorKey] && (
        <div className="text-danger text-left">
          {errors[errorKey].message}
        </div>
      )}
    </>
  )

  const onChange = (e) => {
    console.log(e)
    setError(prev => ({ ...prev, [e.elementType]: e.error }))
    setCardComplete(prev => ({ ...prev, [e.elementType]: e.complete }))
  }

  useEffect(() => {
    // if (!errors || (errors && Object.keys(errors).every(item => item === undefined))) {
    //   setIsBtnDisabled(false)
    // }
    if (Object.values(cardComplete).every(item => item === true)) {
      setIsBtnDisabled(false)
    }
  }, [cardComplete])

  // useEffect(() => {
  //   console.log(stripe)
  //   console.log(elements)
  // }, [stripe, elements])

  const onCancelClick = () => {
    // setError(null)
    // setIsBtnDisabled(true)
    // setCardComplete(CARD_DATA_INITIAL)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    if (isBtnDisabled) {
      elements.getElement("cardNumber").focus()
      return
    }

    setProcessing(true)
    try {
      const payload = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardNumberElement),
        billing_details: { email: userData?.email }
      })
      setHasSub(true)
    }
    catch (e) {
      console.error(e)
    }
    finally {
      setProcessing(false)
    }
    //console.log(payload?.paymentMethod?.id)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-8 mx-auto">
          {/* <div className="logo d-flex justify-content-center">
            <img src="./img/brand/stripe-logo.png" width="175" />
          </div> */}
          <div className="form-group">
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
          <div className="form-group">
            <div style={{ borderBottom: '1px solid #aaa' }}>
              <label className="text-bold">Expiry Date</label>
              <CardExpiryElement
                options={{ ...CARD_OPTIONS, placeholder: 'e.g: 12/22' }}
                onChange={onChange}
              />
            </div>
            {renderInputValidationError('cardExpiry')}
          </div>
          <div className="form-group">
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
              >
                Pay $29
              </button>
              <button type="button" className="btn btn-neutral btn-sm" onClick={onCancelClick}>
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
  const [showStripeForm, setShowStripeForm] = useState(true)

  return (
    <section className="slice slice-sm bg-section-secondary">
      <div className="card card-fluid">
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <p className="mb-0 mt-2">No active subscription present!</p>
            </div>
            <div className="col-md-4 text-md-right">
              <button type="button" className="btn btn-primary btn-sm rounded-pill" onClick={() => setShowStripeForm(true)}>
                Add
                <FontAwesomeIcon
                  icon="plus"
                  color="#ffffff"
                  className="ml-2"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      {
        showStripeForm &&
        (
          <div className="card card-fluid">
            <div className="card-body">
              <Elements stripe={stripePromise} options={ELEMENTS_OPTIONS}>
                <StripeForm />
              </Elements>
            </div>
          </div>
        )
      }
      {/* <div class="card">
        <div class="card-body">
          <div class="row row-grid align-items-center">
            <div class="col-lg-8">
              <div class="media align-items-center">
                <span class="avatar bg-danger text-white rounded-circle mr-3">
                  <FontAwesomeIcon icon="times" color="#ffffff" size="2x" />
                </span>
                <div class="media-body">
                  <h5 class="mb-0">Renew subscription for $20/month</h5>
                  <p class="text-muted lh-150 text-sm mb-0">
                    Email: denigada@gmail.com
                  </p>
                  <p class="text-muted lh-150 text-sm mb-0">
                    Your subscription ended on January 10th, 2020
                  </p>
                </div>
              </div>
            </div>
            <div class="col-auto flex-fill mt-4 mt-sm-0 text-sm-right">
              <a href="#" class="btn btn-sm btn-neutral rounded-pill">
                Renew
              </a>
            </div>
          </div>
        </div>
      </div> */}
    </section>
  )
}

export default UserSubscriptions
