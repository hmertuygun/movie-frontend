const roundNumbers = (input, precision = 2) => {
  if (precision > 2) {
    return Math.floor((Number(input) + Number.EPSILON) * 1000000) / 1000000
  }

  return Math.floor((Number(input) + Number.EPSILON) * 100) / 100
}

export default roundNumbers
