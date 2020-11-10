import React from 'react'
import axios from 'axios'
import { firebase } from '../firebase/firebase'

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

  async function getPositions() {
    const apiUrl = process.env.REACT_APP_API + 'v1/usercomp/positions'

    const token = await firebase.auth().currentUser.getIdToken()
    const positions = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: `Bearer ${token}`,
        'Access-Control-Allow-Methods':
          'GET, POST, PUT, PATCH, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }).then((res) => res.json())

    console.log(positions)
    return positions
  }

  async function setPositions() {
    const apiUrl = process.env.REACT_APP_API + 'v1/usercomp/positions'

    const token = await firebase.auth().currentUser.getIdToken()
    const positions = await axios(apiUrl, {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: `Bearer ${token}`,
        'Access-Control-Allow-Methods':
          'GET, POST, PUT, PATCH, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      method: 'POST',
      data: { position: 'is erikp in the house' },
    })

    console.log(positions)
    return positions
  }

  return (
    <section>
      <h1>Login</h1>
      <p>Login</p>

      <button onClick={() => register('erik.pantzar@jayway.com', 'Furia123!')}>
        Register
      </button>

      <button onClick={() => login('erik.pantzar@jayway.com', 'Furia123!')}>
        Login
      </button>

      <button onClick={() => getPositions()}>Positions log</button>

      <button onClick={() => setPositions()}>Positions POST</button>
    </section>
  )
}

export default Login
