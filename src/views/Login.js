import React, { Fragment } from 'react'
import { Route } from 'react-router-dom'
import { firebase } from '../firebase/firebase'
import { Button, Input, Typography, Logo, Link } from '../components'
import './Login.css'

const LoginView = () => {
  async function register(email, password) {
    const registered = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code
        var errorMessage = error.message

        console.log({ errorCode, errorMessage })
      })

    console.log(registered)
  }

  async function login(email, password) {
    const signedin = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code
        var errorMessage = error.message

        console.log({ errorCode, errorMessage })
      })

    console.log(signedin)
  }


  const LoginTemplate = (
    <Fragment>
      <form onSubmit={(event) => {
        event.preventDefault()
        console.log('submitForm')
      }}>
        <Input label="Email adress" type="email" placeholder="name@example.com"  />

        <Input label="Password" type="password" placeholder="Password" />

        <Button primary type="submit">
          Log in
        </Button>
      </form>


      <div style={{
        display: 'flex'
       }}>
        <Typography color="muted" inline size="small">
          Not registered? {' '}
          <Link to="/login/register">Create account</Link>
        </Typography>  
      </div>
    </Fragment>
  ) 



  const RegisterTemplate = (
    <Fragment>

      <Typography as="h2">Email activation</Typography>
      <Typography>
        After you register your account, you will be asked to<br />
        verify your account in action in the email.
      </Typography>

      <form onSubmit={(event) => {
        event.preventDefault()
        console.log('submitForm')
      }}>
        <Input label="Email adress" type="email" placeholder="name@example.com"  />

        <Input label="Password" type="password" placeholder="Password" />

        <Button primary type="submit">
          Create my account
        </Button>
      </form>


      <div style={{
        display: 'flex'
       }}>
        <Typography color="muted" inline size="small">
          Already have an account? {' '}
          <Link to="/login"> Sign in</Link>
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
    </section>
  )
}

export default LoginView
