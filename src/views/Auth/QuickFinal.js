import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo, Icon } from '../../components'
import { firebase } from '../../firebase/firebase'

const QuickConfirm = ({ actionCode }) => {
  const [validEmail, setValidEmail] = useState(false)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [type, setType] = useState('password')
  const [tos, setTos] = useState(false)
  const [validForm, setValidForm] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const check = async () => {
      await handleVerifyEmail(actionCode)
    }

    check()
  }, [actionCode])

  const toggleTypeText = () => {
    if (type === 'text') {
      setType('password')
    } else {
      setType('text')
    }
  }

  function handleVerifyEmail(actionCode) {
    // Localize the UI to the selected language as determined by the lang
    // parameter.
    // Try to apply the email verification code.

    firebase
      .auth()
      .applyActionCode(actionCode)
      .then(function () {
        // Email address has been verified.
        setValidEmail(true)

        // TODO: If a continue URL is available, display a button which on
        // click redirects the user back to the app via continueUrl with
        // additional state determined from that URL's parameters.
      })
      .catch(function (error) {
        // Code is invalid or expired. Ask the user to verify their email address
        // again.
        setError(error)
      })
  }

  async function registerPassword() {
    await firebase.auth().currentUser.updatePassword(password)

    setTimeout(() => {
      setDone(true)
    }, 300)
  }

  useEffect(() => {
    setValidForm(password && tos)
  }, [password, tos])

  return (
    <div className="container d-flex flex-column">
      <div className="row align-items-center justify-content-center min-vh-100">
        <div className="col-md-6 col-lg-5 col-xl-4 py-6 py-md-0">
          <div className="mb-4">
            <Logo />
          </div>

          <div>
            <p>We are all done. Now login to start using your account.</p>
            <Link to="/login">
              <button className="btn btn-primary">Sign in</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickConfirm
