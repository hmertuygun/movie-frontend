const set = (key, value) => {
  if (typeof key === 'object') {
    for (const [k, v] of Object.entries(key)) {
      setItem(k, v)
    }
  } else setItem(key, value)
}

const setItem = (key, value) => {
  if (typeof value === 'object') value = JSON.stringify(value)
  sessionStorage.setItem(key, value)
}

const get = (key, parse = false) => {
  let data = sessionStorage.getItem(key)
  return parse ? JSON.parse(data) : data
}

const remove = (key) => {
  sessionStorage.removeItem(key)
}

const clear = () => {
  sessionStorage.clear()
}

const session = {
  set,
  get,
  remove,
  clear,
}

export default session
