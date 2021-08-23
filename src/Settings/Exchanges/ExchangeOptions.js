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
  password: yup.string().required('Password is required'),
}
