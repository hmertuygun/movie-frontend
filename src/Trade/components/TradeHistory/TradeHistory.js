import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { getOpenOrders, getOrdersHistory } from '../../../api/api'

const TableHeaderFields = [
  '',
  'Pair',
  'Type',
  'Side',
  'Price',
  'Amount',
  'Filled',
  'Total',
  'Trigger Condition',
  'Status',
  'Date',
  'Cancel',
]
const TableContent = [
  [
    '',
    'BTC-USDT',
    'Limit',
    'Buy',
    '26,000.00',
    '0.005680',
    '0.00',
    '147.68 USDT',
    '<= 26,000.00',
    'Pending',
    '12-29 13:32:34',
    'Cancel',
  ],
  [
    [
      [
        '+',
        'BTC-USDT',
        'Limit',
        'Buy',
        '27,000.00',
        '0.005680',
        '0.00',
        '147.68 USDT',
        '<= 26,000.00',
        'Pending',
        '12-29 13:32:34',
        'Cancel',
      ],
      [
        '',
        'Entry',
        'Limit',
        'Buy',
        '26,000.00',
        '0.005680',
        '0.00',
        '147.68 USDT',
        ' - ',
        'Placed',
      ],
      [
        '',
        'alo',
        'Limit',
        'Buy',
        '26,000.00',
        '0.005680',
        '0.00',
        '147.68 USDT',
        ' - ',
        'Placed',
      ],
    ],
  ],
  [
    [
      [
        '+',
        'ETH-USDT',
        'Limit',
        'Buy',
        '27,000.00',
        '0.005680',
        '0.00',
        '147.68 USDT',
        '<= 26,000.00',
        'Pending',
        '12-29 13:32:34',
        'Cancel',
      ],
      [
        '',
        'Entry',
        'Limit',
        'Buy',
        '26,000.00',
        '0.005680',
        '0.00',
        '147.68 USDT',
        ' - ',
        'Placed',
      ],
      [
        '',
        'alo',
        'Limit',
        'Buy',
        '26,000.00',
        '0.005680',
        '0.00',
        '147.68 USDT',
        ' - ',
        'Placed',
      ],
    ],
  ],
]

const Expandable = ({ entry }) => {
  const [show, setShow] = useState(false)
  return (
    <td
      colspan="12"
      className="px-0"
      style={{ border: 0 }}
      onClick={() => setShow(!show)}
    >
      <table className="table">
        <tbody>
          {entry.map((each, rowIndex) => (
            <tr
              className={rowIndex > 0 ? `collapse ${show ? 'show' : ''}` : ''}
              key={rowIndex}
            >
              {each.map((inner, index) => (
                <td
                  key={index}
                  style={
                    rowIndex === 1 || (index === 0 && rowIndex !== 0)
                      ? { border: 0 }
                      : undefined
                  }
                >
                  {inner}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </td>
  )
}

const Table = ({ isOpenOrders, setIsOpenOrders, history }) => (
  <div className="card card-fluid">
    <div className="card-header pb-0">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <span
            className={isOpenOrders ? 'h6 ' : ''}
            onClick={() => setIsOpenOrders(true)}
          >
            Open Orders
          </span>
          <span
            className={`${!isOpenOrders ? 'h6' : ''} pl-4`}
            onClick={() => setIsOpenOrders(false)}
          >
            Order History
          </span>
        </div>
        <div>
          <input
            className="form-check-input"
            type="checkbox"
            value=""
            id="flexCheckDefault"
          />
          <span className="pr-4">Hide Other Pairs</span>X
        </div>
      </div>
    </div>
    <div className="card-body">
      <table className="table">
        <thead>
          <tr>
            {TableHeaderFields.map((field) => (
              <th scope="col" key={field}>
                {field}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {history &&
            history.map((row, index) => (
              <tr key={index}>
                {row.map((entry, index) => {
                  if (typeof entry === 'string') {
                    return <td key={entry + index}>{entry}</td>
                  } else {
                    return <Expandable key={entry + index} entry={entry} />
                  }
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
)

const MapOrdersToTable = (order) => {
  return [
    '',
    order.symbol,
    order.type,
    order.side,
    order.price,
    order.amount,
    order.filled,
    order.total,
    order.trigger,
    order.status,
    order.update_time,
  ]
}

const TradeHistory = () => {
  const [isOpenOrders, setIsOpenOrders] = useState(true)
  const { data: OpenOrders } = useQuery('OpenOrders', async () => {
    return getOpenOrders().then((orders) => {
      const mappedOrders = orders.items.map(MapOrdersToTable)
      return mappedOrders
    })
  })
  const { data: OrdersHistory } = useQuery('OrdersHistory', async () => {
    return getOrdersHistory().then((orders) => {
      const mappedOrders = orders.items.map(MapOrdersToTable)
      return mappedOrders
    })
  })
  return (
    <Table
      isOpenOrders={isOpenOrders}
      setIsOpenOrders={setIsOpenOrders}
      history={isOpenOrders ? OpenOrders : OrdersHistory}
    />
  )
}

export default TradeHistory
