import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components'

const QuickConfirm = () => {
  return (
    <section>
      <div className="container d-flex flex-column">
        <div className="row align-items-center justify-content-center min-vh-100">
          <div className="col-md-8 col-lg-6 py-6">
            <div>
              <div className="mb-4">
                <Logo />
              </div>
              <div className="mb-4">
                <h6 className="h4 mb-4">Check your inbox.</h6>
                <p className="text-muted mb-4">
                  We just emailed the activation link to your email.
                  <br />
                  Please verify your email to continue. If you don't see our
                  email in your inbox, check your spam folder.
                </p>

                <p className="text-muted mb-0">
                  Haven't received the email?{' '}
                  <Link to="/register">Try again</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default QuickConfirm
