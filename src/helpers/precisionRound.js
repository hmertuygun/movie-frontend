const precisionRound = (input, precision = 2) => {
  if (precision > 5) {
    return ((Number(input) * 1000000) / 1000000).toFixed(precision)
  }
  return ((Number(input) * 10) / 10).toFixed(precision)
}

export default precisionRound