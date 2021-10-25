import React from 'react'
import ReactDOM from 'react-dom'
import { firebase } from './firebase/firebase'
import App from './App'
import reportWebVitals from './reportWebVitals'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'

if ('serviceWorker' in navigator && firebase.messaging.isSupported()) {
  navigator.serviceWorker
    .register(`./firebase-messaging-sw.js`)
    .then(function (registration) {
      console.log('Registration successful, scope is:', registration.scope)
    })
    .catch(function (err) {
      console.log('Service worker registration failed, error:', err)
    })
}

Sentry.init({
  dsn: 'https://c94425406f6c4eac8deca4c5184a18bc@o995119.ingest.sentry.io/5953902',
  integrations: [new Integrations.BrowserTracing()],
  environment: process.env.NODE_ENV,
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
