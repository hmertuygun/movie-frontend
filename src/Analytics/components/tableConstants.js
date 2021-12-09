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
    {
      title: 'CURRENT PRICE',
      render: (rowData) => {
        if (rowData.currentPrice == 0) return '-'
        return rowData.currentPrice
      },
    },
    {
      title: 'POSITION',
      render: (rowData) => {
        if (rowData.currentPrice == 0) return '-'
        if (rowData.position < 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-danger">
              {rowData.position.toFixed(2)}%
            </span>
          )
        } else {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-success">
              +{rowData.position.toFixed(2)}%
            </span>
          )
        }
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

export const assetPerformanceTable = (handleEdit) => {
  return [
    {
      title: 'ASSET',
      render: (rowData) => {
        return rowData.asset
      },
    },
    {
      title: 'DELTA',
      render: (rowData) => {
        if (rowData.value > 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-success">
              {rowData.value}
            </span>
          )
        } else if (rowData.value === 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-soft">
              {rowData.value}
            </span>
          )
        } else {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-danger">
              {rowData.value}
            </span>
          )
        }
      },
    },
  ]
}

export const pairPerformanceTable = (handleEdit) => {
  return [
    {
      title: 'SYMBOL',
      render: (rowData) => {
        return rowData.symbol
      },
    },
    {
      title: 'BASE',
      render: (rowData) => {
        if (rowData.base > 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-success">
              {rowData.base}
            </span>
          )
        } else if (rowData.base === 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-soft">
              {rowData.base}
            </span>
          )
        } else {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-danger">
              {rowData.base}
            </span>
          )
        }
      },
    },
    {
      title: 'QUOTE',
      render: (rowData) => {
        if (rowData.quote > 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-success">
              {rowData.quote}
            </span>
          )
        } else if (rowData.quote === 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-soft">
              {rowData.quote}
            </span>
          )
        } else {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-danger">
              {rowData.quote}
            </span>
          )
        }
      },
    },
  ]
}
