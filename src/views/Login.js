import React, { Fragment, useState, useEffect, useContext } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { UserContext } from '../contexts/UserContext'
import { Button, Input, Typography, Logo, Link } from '../components'
import './Login.css'

const LoginView = () => {
  const { login, register } = useContext(UserContext)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [redirect, setRedirect] = useState(null)

  const doLogin = async () => {
    const loggedin = await login(email, password)
    if (loggedin.message) {
      setError({ message: loggedin.message })
    }
  }

  // clear errors
  useEffect(() => {
    setError('')
  }, [email, password])

  const LoginTemplate = (
    <Fragment>
      <form
        onSubmit={(event) => {
          event.preventDefault()

          if (email && password) {
            doLogin(email, password)
          } else {
            setError({ message: 'You need both email and password to sign in' })
          }
        }}
      >
        <Input
          value={email}
          onChange={(value) => setEmail(value)}
          label="Email adress"
          type="email"
          placeholder="name@example.com"
        />

        <Input
          value={password}
          onChange={(value) => setPassword(value)}
          label="Password"
          type="password"
          placeholder="Password"
          autocomplete="on"
        />

        {error && (
          <div style={{ margin: '1rem 0', textAlign: 'center' }}>
            <span style={{ color: 'red' }}>Error: {error.message}</span>
          </div>
        )}

        <Button primary type="submit">
          Log in
        </Button>
      </form>

      <div
        style={{
          display: 'flex',
        }}
      >
        <Typography color="muted" inline size="small">
          Not registered?{' '}
          <Link to="/login/register" onClick={() => setError({})}>
            Create account
          </Link>
        </Typography>
      </div>
    </Fragment>
  )

  // https://firebase.google.com/docs/auth/web/email-link-auth#send_an_authentication_link_to_the_users_email_address
  const RegisterTemplate = (
    <Fragment>
      <Typography as="h2">Email activation</Typography>
      <Typography>
        After you register your account, you will be asked to
        <br />
        verify your account in action in the email.
      </Typography>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          register(email, password)
        }}
      >
        <Input
          label="Email adress"
          type="email"
          onChange={(value) => setEmail(value)}
          value={email}
          placeholder="name@example.com"
        />

        <Input
          label="Password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(value) => setPassword(value)}
        />

        {error && (
          <div style={{ margin: '1rem 0', textAlign: 'center' }}>
            <span style={{ color: 'red' }}>Error: {error.message}</span>
          </div>
        )}

        <Button primary type="submit">
          Create my account
        </Button>
      </form>

      <div
        style={{
          display: 'flex',
        }}
      >
        <Typography color="muted" inline size="small">
          Already have an account? <Link to="/login"> Sign in</Link>
        </Typography>
      </div>
    </Fragment>
  )

  return (
    <section className="Login-container">
      <div style={{ textAlign: 'center' }}>
        <Logo />
      </div>

      <Route exact path="/login" render={() => LoginTemplate} />
      <Route path="/login/register" render={() => RegisterTemplate} />

      {redirect && <Redirect to={redirect} />}
    </section>
  )
}

export default LoginView
