export const sortExchangesData = (data) => {
  const exchanges = Object.keys(data).filter(
    (value) => value !== 'activeLastSelected'
  )
  const apiKeys = exchanges.map((exchange) => {
    let keys = exchange.split('__')
    let status = data[exchange].status
    let active = data['activeLastSelected'] === exchange
    return {
      apiKeyName: keys[0],
      exchange: keys[1],
      status: status,
      isLastSelected: active,
    }
  })
  return apiKeys
}
