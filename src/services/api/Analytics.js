import httpClient from 'services/http'
import createQueryString from 'utils/createQueryString'

const ANALYTICS = process.env.REACT_APP_ANALYTICS_API

const getAnalytics = async ({
  startDate,
  endDate,
  apiKeyName,
  exchange,
  skipCache,
}) => {
  const params = {
    api_key: apiKeyName,
    exchange: exchange,
  }
  if (startDate) params['start_date'] = startDate
  if (endDate) params['end_date'] = endDate
  if (skipCache) params['skip_cache'] = true
  let apiUrl = `${ANALYTICS}?${createQueryString(params)}`

  return await httpClient(apiUrl, 'GET')
}

export { getAnalytics }
