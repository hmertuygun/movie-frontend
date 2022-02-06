import { handleChangeTickSize } from '../../../helpers/useTickSize'

export const tableConstants = (handleEdit) => {
  return [
    {
      title: 'SYMBOL',
      render: (rowData) => {
        return rowData.SYMBOL
      },
    },
    {
      title: 'AVAILABLE BALANCE',
      render: (rowData) => {
        return handleChangeTickSize(rowData.BALANCE, rowData.SYMBOL)
      },
    },
    {
      title: 'RESERVED',
      render: (rowData) => {
        return handleChangeTickSize(rowData.RESERVED, rowData.SYMBOL)
      },
    },
    {
      title: 'TOTAL',
      render: (rowData) => {
        return handleChangeTickSize(rowData.TOTAL, rowData.SYMBOL)
      },
    },
    {
      title: 'BTC VALUE',
      render: (rowData) => {
        return handleChangeTickSize(rowData.BALANCE, 'BTC-USDT')
      },
    },
    {
      title: 'USD VALUE',
      render: (rowData) => {
        return rowData.USD
      },
    },
    /*  {
      title: 'Action',
      render: rowData => {
        return <button className='btn btn-warning' onClick={handleEdit(rowData)}>Edit</button>
      },
    }, */
  ]
}
