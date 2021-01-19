import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../../components'
import { UserContext } from '../../contexts/UserContext'

const QuickConfirm = () => {
  const { sendEmailAgain } = useContext(UserContext)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ status, setStatus ] = useState('')

  function timeout(delay: number) {
    return new Promise( res => setTimeout(res, delay) );
  }
  const sendAgain = async () => {
    setIsLoading(true)
    try {
      const response = await sendEmailAgain()
    } catch(e) {
      setStatus('Please wait before trying again.')
    }
    
    await timeout(1000)
    setStatus('Email resent')
    setIsLoading(false)
  }

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

                
                  <div className="mt-4">
                  <button
                    onClick={() => sendAgain()}
                    className="btn btn-block btn-primary"
                    disabled={isLoading}
                   > {isLoading ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : (
                      'Resend email'
                    )}
                  </button>

                  {status ?
                  <p className="text-sm mt-3 text-danger">{status.message}</p>
                : <p />}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default QuickConfirm
