import React, { useState } from 'react'
import { Icon } from '../../../components'
import useIntersectionObserver from './useIntersectionObserver'

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

const Expandable = ({ entry }) => {
  const [show, setShow] = useState(false)
  return (
    <>
      {entry.map((order, rowIndex) => {
        const tdStyle = rowIndex === 1 ? { border: 0 } : undefined
        return (
          <tr
            className={rowIndex > 0 ? `collapse ${show ? 'show' : ''}` : ''}
            key={rowIndex}
            onClick={() => setShow(!show)}
          >
            <td style={rowIndex !== 0 ? { border: 0 } : undefined}>
              {rowIndex === 0 ? <Icon icon="chevron-down" /> : null}
            </td>
            <td style={tdStyle}>{order.symbol}</td>
            <td style={tdStyle}>{order.type}</td>
            <td
              style={{
                ...tdStyle,
                color: order.side === 'buy' ? 'green' : 'red',
              }}
            >
              {order.side}
            </td>
            <td style={tdStyle}>{order.price}</td>
            <td style={tdStyle}>{order.amount}</td>
            <td style={tdStyle}>{order.filled}</td>
            <td style={tdStyle}>
              {order.total} {order.quote_asset}
            </td>
            <td style={tdStyle}>{order.trigger}</td>
            <td style={tdStyle}>{order.status}</td>
            <td style={tdStyle}>{order.timestamp}</td>
            {rowIndex === 0 ? (
              <td style={{ ...tdStyle, color: 'red' }}>Cancel</td>
            ) : null}
          </tr>
        )
      })}
    </>
  )
}

const OpenOrdersTableBody = ({ infiniteOrders }) => {
  const {
    status,
    data: history,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = infiniteOrders
  const loadMoreButtonRef = React.useRef()
  useIntersectionObserver({
    target: loadMoreButtonRef,
    onIntersect: fetchNextPage,
    enabled: hasNextPage,
  })
  return (
    <tbody>
      {history &&
        history.pages.map((items, index) => (
          <React.Fragment key={index}>
            {items.map((order, rowIndex) => {
              const orders = [order, ...order.orders]
              return <Expandable entry={orders} key={rowIndex} />
            })}
          </React.Fragment>
        ))}
      <button ref={loadMoreButtonRef} onClick={() => fetchNextPage()}>
        {isFetchingNextPage
          ? 'Loading more...'
          : hasNextPage
          ? 'Load Newer'
          : 'Nothing more to load'}
      </button>
    </tbody>
  )
}

export default OpenOrdersTableBody
