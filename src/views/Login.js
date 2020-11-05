import React from "react"

// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app"
// If you are using v7 or any earlier version of the JS SDK, you should import firebase using namespace import
// import * as firebase from "firebase/app"

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics"

// Add the Firebase products that you want to use
import "firebase/auth"
import "firebase/firestore"

// TODO: Replace the following with your app's Firebase project configuration
// For Firebase JavaScript SDK v7.20.0 and later, `measurementId` is an optional field

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGESENDERID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENTID,
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
firebase.analytics()

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
    <section>
      <h1>Login</h1>
      <p>Login</p>

      <button onClick={() => register("erik.pantzar@jayway.com", "Furia123!")}>
        Register
      </button>

      <button onClick={() => login("erik.pantzar@jayway.com", "Furia123!")}>
        Login
      </button>
    </section>
  )
}

export default Login
