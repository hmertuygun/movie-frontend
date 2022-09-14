export const tableConstants = () => {
  return {
    Header: 'BALANCES',
    isVisible: false,
    columns: [
      {
        Header: 'SYMBOL',
        accessor: 'SYMBOL',
      },
      {
        Header: 'BALANCE',
        accessor: 'BALANCE',
      },
      {
        Header: 'BTC VALUE',
        accessor: 'BTC',
      },
      {
        Header: 'RESERVED',
        accessor: 'RESERVED',
      },

      {
        Header: 'TOTAL',
        accessor: 'TOTAL',
      },
      {
        Header: 'USD',
        accessor: 'USD',
      },
    ],
  }
}
