import React from 'react'
import ReactDOM from 'react-dom'
import { firebase } from 'services/firebase'
import App from './App'
import reportWebVitals from './reportWebVitals'
import store from './store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import { consoleLogger } from 'utils/logger'

let persistor = persistStore(store)

if ('serviceWorker' in navigator && firebase.messaging.isSupported()) {
  navigator.serviceWorker
    .register(`./firebase-messaging-sw.js`)
    .then(function (registration) {
      consoleLogger('Registration successful, scope is:', registration.scope)
    })
    .catch(function (err) {
      consoleLogger('Service worker registration failed, error:', err)
    })
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
