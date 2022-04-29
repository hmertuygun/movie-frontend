import createQueryString from 'utils/createQueryString'

const getExchangeKlines = async (exchange, url, data) => {
  const { symbol, interval, startTime, endTime, limit } = data
  const params = {
    symbol: symbol,
    interval: interval,
  }
  if (startTime) params['startTime'] = startTime
  if (endTime) params['endTime'] = endTime
  if (limit) params['limit'] = limit

  const apiUrl = `${url}?${createQueryString(params)}`
  return fetch(apiUrl)
    .then((res) => {
      return res.json()
    })
    .then((json) => {
      if (json.result) return json.result
      return json
    })
}

export { getExchangeKlines }
