const set = (key, value) => {
  if (typeof key === 'object') {
    for (const [k, v] of Object.entries(key)) {
      setItem(k, v)
    }
  } else setItem(key, value)
}

const setItem = (key, value) => {
  if (typeof value === 'object') value = JSON.stringify(value)
  localStorage.setItem(key, value)
}

const get = (key, parse = false) => {
  let data = localStorage.getItem(key)
  return parse ? JSON.parse(data) : data
}

const remove = (key) => {
  localStorage.removeItem(key)
}

const clear = () => {
  localStorage.clear()
}

const storage = {
  set,
  get,
  remove,
  clear,
}

export default storage
