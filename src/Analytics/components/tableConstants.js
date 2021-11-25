export const tableConstants = (handleEdit) => {
  return [
    {
      title: 'SYMBOL',
      render: (rowData) => {
        return rowData.symbol
      },
    },
    {
      title: 'SIDE',
      render: (rowData) => {
        if (rowData.side === 'buy') {
          return (
            <span className="badge badge-success">
              {rowData.side.toUpperCase()}
            </span>
          )
        } else {
          return (
            <span className="badge badge-danger">
              {rowData.side.toUpperCase()}
            </span>
          )
        }
      },
    },
    {
      title: 'AVERAGE PRICE',
      render: (rowData) => {
        return rowData['avg. price']
      },
    },
    {
      title: 'QUANTITY',
      render: (rowData) => {
        return rowData.quantity
      },
    },
    {
      title: 'SUM',
      render: (rowData) => {
        return rowData.sum
      },
    },
    {
      title: 'OPERATIONS',
      render: (rowData) => {
        return rowData.operations
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
