const roundNumbers = (input, precision = 2) => {
  if (precision > 5) {
    return Math.round((input + Number.EPSILON) * 1000000) / 1000000
  }

  return Math.round((input + Number.EPSILON) * 100) / 100
}

export default roundNumbers
