export const tableDataSorting = async (data, key, type) => {
  let result = data.sort(function (a, b) {
    if (typeof a[key] === 'string') {
      if (type) {
        if (a[key] > b[key]) {
          return 1
        }
        if (a[key] < b[key]) {
          return -1
        }
      } else {
        if (a[key] > b[key]) {
          return -1
        }
        if (a[key] < b[key]) {
          return 1
        }
      }
      return 0
    } else {
      if (type) {
        return a[key] - b[key]
      } else {
        return b[key] - a[key]
      }
    }
  })

  return await result
}
