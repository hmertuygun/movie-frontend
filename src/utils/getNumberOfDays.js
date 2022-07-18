import dayjs from 'dayjs'

export const getNumberOfDays = (date) => {
  let days = Math.ceil(dayjs(date * 1000).diff(dayjs(), 'days'))
  return days
}
