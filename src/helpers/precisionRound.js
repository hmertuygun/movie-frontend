const precisionRound = (input, precision = 2) => {
  if (precision > 5) {
    return ((Number(input) * 1000000) / 1000000).toFixed(precision)
  }

  /*   if (precision === 6) {
    return ((Number(input) * 1000000) / 1000000).toFixed(precision)
  } */

  return Math.floor((Number(input) + Number.EPSILON) * 100) / 100
}

export default precisionRound
