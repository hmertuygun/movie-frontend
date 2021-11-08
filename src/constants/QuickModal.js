export const errorInitialValues = {
  exchange: '',
  apiName: '',
}

export const customStyles = {
  control: (styles) => ({
    ...styles,
    backgroundColor: '#eff2f7',
    padding: '5px 5px',
    border: 0,
    boxShadow: 'none',

    '&:hover': {
      backgroundColor: '#d6ddea',
      cursor: 'pointer',
    },
  }),

  placeholder: (styles) => ({
    ...styles,
    color: '#273444',
    fontWeight: 'bold',
  }),
}

export const defaultExchange = {
  value: 'binance',
  label: 'Binance',
  placeholder: 'Binance',
}
