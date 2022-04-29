const createKeyValuePair = (key, value) => {
  if (Array.isArray(value))
    return value.map((x) => createKeyValuePair(key, x)).join('&')
  return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
}

const createQueryString = (params) =>
  params &&
  Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null)
    .map((key) => createKeyValuePair(key, params[key]))
    .join('&')

export default createQueryString
