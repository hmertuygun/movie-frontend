import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useSelector } from 'react-redux'

const Checkout = ({ creds, paymentCallback, isUpdate }) => {
  const { userData } = useSelector((state) => state.users)
  const [clientSecret] = useState(creds.clientSecret)
  const [messages, _setMessages] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({})

  const setMessage = (message) => {
    _setMessages(`${message}`)
  }

  const stripe = useStripe()
  const elements = useElements()

  if (!stripe || !elements) {
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const cardElement = elements.getElement(CardElement)
    let error = {}
    let paymentIntent = {}

    if (!isUpdate) {
      let data = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { address: form },
        },
        receipt_email: userData.email,
      })
      error = data.error
      paymentIntent = data.paymentIntent
    } else {
      let data = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { address: form },
      })
      error = data.error
      paymentIntent = data.paymentMethod
    }

    if (error) {
      setMessage(error.message)
      setIsLoading(false)
      return
    }

    if (
      (paymentIntent && paymentIntent.status === 'succeeded') ||
      (isUpdate && paymentIntent?.id)
    ) {
      paymentCallback(paymentIntent)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-sm-9">
            <div className="form-group">
              <label className="form-control-label">Address</label>
              <input
                className="form-control"
                type="text"
                placeholder="Enter your address"
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form-group">
              <label className="form-control-label">Number</label>
              <input
                className="form-control"
                type="tel"
                placeholder="No."
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
                required
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4">
            <div className="form-group">
              <label className="form-control-label">City</label>
              <input
                className="form-control"
                type="text"
                placeholder="City"
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="col-sm-4">
            <div className="form-group">
              <label className="form-control-label">ZIP</label>
              <input
                className="form-control"
                type="tel"
                placeholder="ZIP"
                onChange={(e) =>
                  setForm({ ...form, postal_code: e.target.value })
                }
                required
              />
            </div>
          </div>
        </div>
        <div className="form-group">
          <CardElement className="form-control mt-2" />
        </div>
        <button
          disabled={isLoading}
          className="btn btn-sm btn-warning hover-translate-y-n3 hover-shadow-lg"
        >
          {isLoading ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            'Subscribe With Card'
          )}
        </button>

        {messages && (
          <div>
            <div className="alert alert-danger mt-4" role="alert">
              <strong>{messages}</strong>
            </div>
          </div>
        )}
      </form>
    </>
  )
}

export default withRouter(Checkout)
