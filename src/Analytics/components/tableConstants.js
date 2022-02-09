import { handleChangeTickSize } from '../../helpers/useTickSize'

export const tableConstants = (handleEdit) => {
  return [
    {
      title: 'PAIR',
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
      title: 'ROE%',
      render: (rowData) => {
        if (rowData.current_price === null) return '-'
        if (rowData.position < 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-danger">
              {rowData.position}%
            </span>
          )
        } else {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-success">
              +{rowData.position}%
            </span>
          )
        }
      },
    },
    {
      title: 'PNL',
      render: (rowData) => {
        return rowData.pnl
      },
    },
    {
      title: 'AVERAGE PRICE',
      render: (rowData) => {
        return handleChangeTickSize(rowData['avg. price'], rowData.symbol)
      },
    },
    {
      title: 'CURRENT PRICE',
      render: (rowData) => {
        if (rowData.current_price === null) return '-'
        return handleChangeTickSize(rowData.current_price, rowData.symbol)
      },
    },
    {
      title: 'QUANTITY',
      render: (rowData) => {
        return handleChangeTickSize(rowData.quantity, rowData.symbol)
      },
    },
    {
      title: 'SUM',
      render: (rowData) => {
        return handleChangeTickSize(rowData.sum, rowData.symbol)
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

export const assetPerformanceTable = (handleEdit) => {
  return [
    {
      title: 'ASSET',
      render: (rowData) => {
        return rowData.asset
      },
    },
    {
      title: 'CHANGE',
      render: (rowData) => {
        if (rowData.value > 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-success">
              {handleChangeTickSize(rowData.value, rowData.asset)}
            </span>
          )
        } else if (rowData.value === 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-soft">
              {handleChangeTickSize(rowData.value, rowData.asset)}
            </span>
          )
        } else {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-danger">
              {handleChangeTickSize(rowData.value, rowData.asset)}
            </span>
          )
        }
      },
    },
    {
      title: 'BTC VALUE',
      render: (rowData) => {
        if (rowData.BTC > 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-success">
              {handleChangeTickSize(rowData.BTC, 'BTC-USDT')}
            </span>
          )
        } else if (rowData.BTC === 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-soft">
              {handleChangeTickSize(rowData.BTC, 'BTC-USDT')}
            </span>
          )
        } else {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-danger">
              {handleChangeTickSize(rowData.BTC, 'BTC-USDT')}
            </span>
          )
        }
      },
    },
    {
      title: 'USD VALUE',
      render: (rowData) => {
        if (rowData.USDT > 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-success">
              {rowData.USDT}
            </span>
          )
        } else if (rowData.USDT === 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-soft">
              {rowData.USDT}
            </span>
          )
        } else {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-danger">
              {rowData.USDT}
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
      title: 'PAIR',
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
              {handleChangeTickSize(rowData.base, rowData.symbol)}
            </span>
          )
        } else if (rowData.base === 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-soft">
              {handleChangeTickSize(rowData.base, rowData.symbol)}
            </span>
          )
        } else {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-danger">
              {handleChangeTickSize(rowData.base, rowData.symbol)}
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
              {handleChangeTickSize(rowData.quote, rowData.symbol)}
            </span>
          )
        } else if (rowData.quote === 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-soft">
              {handleChangeTickSize(rowData.quote, rowData.symbol)}
            </span>
          )
        } else {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-danger">
              {handleChangeTickSize(rowData.quote, rowData.symbol)}
            </span>
          )
        }
      },
    },
    {
      title: 'BTC VALUE',
      render: (rowData) => {
        if (rowData.BTC > 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-success">
              {handleChangeTickSize(rowData.BTC, 'BTC-USDT')}
            </span>
          )
        } else if (rowData.BTC === 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-soft">
              {handleChangeTickSize(rowData.BTC, 'BTC-USDT')}
            </span>
          )
        } else {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-danger">
              {handleChangeTickSize(rowData.BTC, 'BTC-USDT')}
            </span>
          )
        }
      },
    },
    {
      title: 'USD VALUE',
      render: (rowData) => {
        if (rowData.USDT > 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-success">
              {rowData.USDT}
            </span>
          )
        } else if (rowData.USDT === 0) {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-soft">
              {rowData.USDT}
            </span>
          )
        } else {
          return (
            <span style={{ fontSize: '0.8rem' }} className="text-danger">
              {rowData.USDT}
            </span>
          )
        }
      },
    },
  ]
}
