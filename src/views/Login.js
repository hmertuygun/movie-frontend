import React from 'react'
import { firebase } from '../firebase/firebase'
import './Login.css'
import { Button, Input, Typography, Logo, Link } from '../components'

const Login = () => {
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

  return (
    <section className="Login-container">
              
      <Logo />


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
        <Typography color="muted" inline size="small">Not registered?</Typography>  
        <Link to="/register">Create account</Link>
      </div>

    </section>
  )
}

export default Login
