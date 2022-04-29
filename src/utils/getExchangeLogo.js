import { exchangeCreationOptions } from 'constants/ExchangeOptions'

const getLogo = (exchange) => {
  const obj = exchangeCreationOptions.find((sy) => sy.value === exchange)
  if (obj?.logo) return obj.logo
}

export default getLogo
