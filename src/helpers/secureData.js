const cryptoJS = require('crypto-js')

export const encryptData = (value, key) => {
  return cryptoJS.AES.encrypt(JSON.stringify(value), key).toString()
}

export const decryptData = async (value, key) => {
  let decrypt = await cryptoJS.AES.decrypt(value, key)
  let decryptData = await JSON.parse(decrypt.toString(cryptoJS.enc.Utf8))
  return decryptData
}
