import dayjs from 'dayjs'

export const getNumberOfDays = (date) => {
  let dateOne = new Date(dayjs(date * 1000))
  let dateTwo = new Date()
  let difference = dateOne.getTime() - dateTwo.getTime()
  let days = Math.ceil(difference / (2000 * 3600 * 24))
  return days
}
