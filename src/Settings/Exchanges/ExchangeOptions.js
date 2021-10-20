import * as yup from 'yup'
export const options = [
  {
    value: 'binance',
    label: 'Binance',
    placeholder: 'Binance',
    fields: { Key: 'apiKey', Secret: 'secret' },
  },
  // { value: 'ftx', label: 'FTX' },
  {
    value: 'binanceus',
    label: 'Binance.US',
    placeholder: 'BinanceUS',
    fields: { Key: 'apiKey', Secret: 'secret' },
  },
  {
    value: 'kucoin',
    label: 'KuCoin',
    placeholder: 'KuCoin',
    fields: { Key: 'apiKey', Secret: 'secret', Passphrase: 'password' },
  },
]

export const validationRules = {
  exchange: yup.string().required('Exchange is required'),
  apiName: yup
    .string()
    .required('API Name is required')
    .min(3, 'Must be at least 3 characters')
    .matches(/^[a-zA-Z0-9]+$/, {
      message: 'Accepted characters are A-Z, a-z and 0-9.',
      excludeEmptyString: true,
    }),
  apiKey: yup
    .string()
    .required('API Key is required')
    .min(3, 'Must be at least 3 characters'),
  secret: yup.string().required('API Secret is required'),
  password: yup.string().required('Passphrase is required'),
}

export const exchangeCreationOptions = [
  {
    value: 'binance',
    url: 'https://accounts.binance.com/en/register?ref=UR7ZCKEJ',
    image: 'img/svg/exchange/binance.svg',
    logo: 'img/icons/brands/binance.svg',
    label: 'Binance',
  },
  {
    value: 'binanceus',
    url: 'https://accounts.binance.us/en/register',
    image: 'img/svg/exchange/binanceus.svg',
    logo: 'img/icons/brands/binanceus.svg',
    label: 'Binance.US',
  },
  {
    value: 'kucoin',
    url: 'https://www.kucoin.com/ucenter/signup?rcode=r3JHGQU',
    image: 'img/svg/exchange/kucoin.svg',
    logo: 'img/icons/brands/kucoin.svg',
    label: 'KuCoin',
  },
]
