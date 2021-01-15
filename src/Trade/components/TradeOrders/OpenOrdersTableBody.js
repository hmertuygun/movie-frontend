import React, { useState } from 'react'
import { cancelTradeOrder } from '../../../api/api'
import { Icon } from '../../../components'
import useIntersectionObserver from './useIntersectionObserver'

const Expandable = ({ entry }) => {
  const [show, setShow] = useState(false)
  return (
    <>
      {entry.map((order, rowIndex) => {
        const tdStyle = rowIndex === 1 ? { border: 0 } : undefined
        const rowClass = rowIndex > 0 ? `collapse ${show ? 'show' : ''}` : ''
        const rowClick = () => setShow(!show)
        const firstColumnIconStyle = rowIndex !== 0 ? { border: 0 } : undefined
        const firstColumnIcon =
          rowIndex === 0 ? (
            <Icon icon={`chevron-${show ? 'down' : 'right'}`} />
          ) : null
        const sideColumnStyle = {
          ...tdStyle,
          color: order.side === 'buy' ? 'green' : 'red',
        }
        const cancelColumn =
          rowIndex === 0 ? (
            <td
              style={{ ...tdStyle, color: 'red' }}
              onClick={() => {
                cancelTradeOrder(order.trade_id)
              }}
            >
              Cancel
            </td>
          ) : null
        return (
          <tr className={rowClass} key={rowIndex} onClick={rowClick}>
            <td style={firstColumnIconStyle}>{firstColumnIcon}</td>
            <td style={tdStyle}>{order.symbol}</td>
            <td style={tdStyle}>{order.type}</td>
            <td style={sideColumnStyle}>{order.side}</td>
            <td style={tdStyle}>{order.price}</td>
            <td style={tdStyle}>{order.amount}</td>
            <td style={tdStyle}>{order.filled}</td>
            <td style={tdStyle}>
              {order.total} {order.quote_asset}
            </td>
            <td style={tdStyle}>{order.trigger}</td>
            <td style={tdStyle}>{order.status}</td>
            <td style={tdStyle}>{order.timestamp}</td>
            {cancelColumn}
          </tr>
        )
      })}
    </>
  )
}

const OpenOrdersTableBody = ({ infiniteOrders }) => {
  const {
    data: history,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
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
      <tr ref={loadMoreButtonRef}>
        <td colSpan="12">
          {isFetchingNextPage
            ? 'Loading more...'
            : hasNextPage
            ? 'Load Newer'
            : 'Nothing more to load'}
        </td>
      </tr>
    </tbody>
  )
}

export default OpenOrdersTableBody
