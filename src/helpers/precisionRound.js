const precisionRound = (input, precision = 2) => {
  if (precision > 5) {
    return ((Number(input) * 1000000) / 1000000).toFixed(precision)
  }
  return ((Number(input) * 10) / 10).toFixed(precision)
}

export default precisionRound

export const addPrecisionToNumber = (value, precisionCount) => {
  // const splittedValue = value.toString().split('.')[0]
  // const precision = splittedValue.length + precisionCount
  if (value) {
    if (value === '0') {
      return Number(value)
    }
    return Number(value).toFixed(precisionCount)
    // if (splittedValue === '0') {
    //   return Number(value).toPrecision(precisionCount)
    // }
  }
  return ''
}
