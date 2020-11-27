import React, { Fragment, useState, useEffect, useContext } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { firebase } from '../firebase/firebase'
import { UserContext } from '../contexts/UserContext'
import { Button, Input, Typography, Logo, Link } from '../components'
import './Login.css'

const LoginView = () => {
  const { login } = useContext(UserContext)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [redirect, setRedirect] = useState(null)

  // clear errors
  useEffect(() => {
    setError('')
  }, [email, password])

  async function register(email, password) {
    const registered = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code
        var errorMessage = error.message

        setError({ message: errorMessage, code: errorCode })
      })

    console.log(registered)

    if (registered !== undefined) {
      console.log({ registered })
    }

    return true
  }

  async function doLogin(email, password) {
    const signedin = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code
        var errorMessage = error.message

        setError({ message: errorMessage, code: errorCode })

        return false
      })

    if (signedin) {
      login(signedin)
      setRedirect('/trade')
    }

    return true
  }

  const LoginTemplate = (
    <Fragment>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          doLogin(email, password)
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
