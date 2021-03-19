import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import reportWebVitals from './reportWebVitals'
import './styles/theme.css'
import './styles/styles.css'
import './styles/quick-website.css'

if ("serviceWorker" in navigator) {
  const swPath = process.env.NODE_ENV !== "production" ? "./firebase/dev/" : "./firebase/prod/"
  navigator.serviceWorker
    .register(`./firebase-messaging-sw.js`)
    .then(function (registration) {
      console.log("Registration successful, scope is:", registration.scope);
    })
    .catch(function (err) {
      console.log("Service worker registration failed, error:", err);
    });
}

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
