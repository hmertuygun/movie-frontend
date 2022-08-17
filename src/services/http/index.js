import axios from 'axios'
import { getHeaders } from 'services/api/Headers'
import { handleResponse, handleError } from './response'
import { firebase } from 'services/firebase'

const getHeadersForAPI = async () => {
  if (firebase.auth().currentUser === null) {
    await new Promise(() => setTimeout(getHeadersForAPI, 1000))
  }
  return await getHeaders()
}

const httpClient = async (url, type, data, needSign) => {
  const config = {
    headers: await getHeadersForAPI(),
    method: type,
  }
  if (data) config.data = data

  return await axios(url, config)
    .then((response) => handleResponse(response, needSign))
    .catch(handleError)
}

export default httpClient
