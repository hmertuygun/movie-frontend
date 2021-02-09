export const addPrecisionToNumber = (value, precisionCount) => {
  if (value) {
    if (value === '0') return Number(value)
    if (precisionCount > 8) return Number(value).toFixed(0)
    return Number(value).toFixed(precisionCount)
  }
  return ''
}

export const removeTrailingZeroFromInput = (value) => Number(value).toString()

export const getMaxInputLength = (value, precision) => {
  const splittedValue = value.split('.')
  const leftSplittedValueLength = splittedValue[0].length
  const allowedInputLength = leftSplittedValueLength + precision
  return allowedInputLength
}

export const getInputLength = (value) => value.split('.').join('').length
