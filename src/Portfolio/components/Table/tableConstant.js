export const tableConstants = (handleEdit) => {
  return [
    {
      title: 'SYMBOL',
      render: rowData => {
        return rowData.SYMBOL; 
      },
    },
    {
      title: 'AVAILABLE BALANCE',
      render: rowData => {
        return rowData.BALANCE;
      },
    },
    {
      title: 'RESERVED',
      render: rowData => {
        return rowData.RESERVED;
      },
    },
    {
      title: 'TOTAL',
      render: rowData => {
        return rowData.TOTAL;
      },
    },
    {
      title: 'BTC VALUE',
      render: rowData => {
        return rowData.BTC;
      },
    },
    {
      title: 'USD VALUE',
      render: rowData => {
        return rowData.USD;
      },
    },
   /*  {
      title: 'Action',
      render: rowData => {
        return <button className='btn btn-warning' onClick={handleEdit(rowData)}>Edit</button>
      },
    }, */
  ];
};
