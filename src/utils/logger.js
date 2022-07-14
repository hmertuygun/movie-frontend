export const consoleLogger = (...data) => {
  process.env.NODE_ENV !== 'production' && console.log(...data)
}

export const consoleWarn = (...data) => {
  process.env.NODE_ENV !== 'production' && console.warn(...data)
}

export const consoleError = (...data) => {
  process.env.NODE_ENV !== 'production' && console.error(...data)
}

export const consoleInfo = (...data) => {
  process.env.NODE_ENV !== 'production' && console.info(...data)
}
