import axios from 'axios'
import { getHeaders } from 'services/api/Headers'
import { handleResponse, handleError } from './response'

const httpClient = async (url, type, data) => {
  const config = {
    headers: await getHeaders(),
    method: type,
  }
  if (data) config.data = data

  return await axios(url, config).then(handleResponse).catch(handleError)
}

export default httpClient
