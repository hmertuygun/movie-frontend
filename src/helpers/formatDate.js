export const pad = (num, size) => {
  num = num.toString()
  while (num.length < size) num = '0' + num
  return num
}

export const formatDate = (date) => {
  const objDate = new Date(date)
  return `${objDate.getFullYear()}-${pad(objDate.getMonth() + 1, 2)}-${pad(
    objDate.getDate(),
    2
  )} ${pad(objDate.getHours(), 2)}:${pad(objDate.getMinutes(), 2)}:${pad(
    objDate.getSeconds(),
    2
  )}`
}
