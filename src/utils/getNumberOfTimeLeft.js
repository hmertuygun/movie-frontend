import dayjs from 'dayjs'
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

export const getNumberOfTimeLeft = (date) => {
  return dayjs(date * 1000).toNow(true)
}
