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
  {
    value: 'bybit',
    label: 'ByBit',
    placeholder: 'ByBit',
    fields: { Key: 'apiKey', Secret: 'secret' },
  },
  {
    value: 'huobipro',
    label: 'HuobiPro',
    placeholder: 'Huobi Pro',
    fields: { Key: 'apiKey', Secret: 'secret' },
  },
  {
    value: 'okex',
    label: 'OKEx',
    placeholder: 'OKEx',
    fields: { Key: 'apiKey', Secret: 'secret', Passphrase: 'password' },
  },
]

export const exchangeSystems = {
  ccxt: ['binance', 'binanceus', 'kucoin', 'okex'],
  own: ['bybit', 'huobipro'],
}

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
  {
    value: 'bybit',
    url: 'https://partner.bybit.com/b/coinpanel',
    image: 'img/svg/exchange/bybit.svg',
    logo: 'img/icons/brands/ByBit_Icon.png',
    label: 'ByBit',
  },
  {
    value: 'huobipro',
    url: ' https://www.huobi.com/en-us/register/?inviter_id=11339800',
    image: 'img/svg/exchange/huobipro.svg',
    logo: 'img/icons/brands/huobi.png',
    label: 'Huobi',
  },
  {
    value: 'okex',
    url: 'https://www.okx.com/join/11966961',
    image: 'img/svg/exchange/okex.svg',
    logo: 'img/icons/brands/okex.png',
    label: 'OKEx',
  },
]
