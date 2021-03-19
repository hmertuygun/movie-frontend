//swEnvBuild.js - script that is separate from webpack
require('dotenv').config() // make sure you have '.env' file in pwd
const fs = require('fs')

fs.writeFileSync(
  './public/swenv.js',
  `
const process = {
  env: {
    REACT_APP_FIREBASE_API_KEY: "${process.env.REACT_APP_FIREBASE_API_KEY}",
    REACT_APP_FIREBASE_PROJECT_ID: "${process.env.REACT_APP_FIREBASE_PROJECT_ID}",
    REACT_APP_FIREBASE_APP_ID: "${process.env.REACT_APP_FIREBASE_APP_ID}",
    REACT_APP_FIREBASE_MESSAGESENDERID: "${process.env.REACT_APP_FIREBASE_MESSAGESENDERID}",
  }
}
`
)
