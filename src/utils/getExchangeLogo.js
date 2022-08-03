import { EXCHANGES } from 'constants/Exchanges'

const getLogo = (exchange) => {
  const obj = EXCHANGES[exchange]
  if (obj?.logo) return obj.logo
}

export default getLogo
