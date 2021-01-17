import React, { useState } from 'react'
import { cancelTradeOrder } from '../../../api/api'
import { Icon } from '../../../components'
import useIntersectionObserver from './useIntersectionObserver'
import styles from './tooltip.module.css'
import Moment from 'react-moment'

const Expandable = ({ entry }) => {
  const [show, setShow] = useState(false)
  return (
    <>
      {entry.map((order, rowIndex) => {
        const tdStyle = rowIndex === 1 ? { border: 0 } : undefined
        const rowClass = rowIndex > 0 ? `collapse ${show ? 'show' : ''}` : ''
        const rowClick = () => { if (order.type == "Full Trade") setShow(!show) }
        const firstColumnIconStyle = rowIndex !== 0 ? { border: 0 } : undefined
        const firstColumnIcon =
          rowIndex === 0 && order.type == "Full Trade" ? (
            <Icon icon={`chevron-${show ? 'down' : 'right'}`} />
          ) : null
        const sideColumnStyle = {
          ...tdStyle,
          color: order.side === 'Buy' ? 'green' : 'red',
        }
        const hideFirst = {
          ...tdStyle,
          color: rowIndex === 0 && order.type == "Full Trade" && show ? 
          'transparent' : undefined
        }
        const cancelColumn =
          rowIndex === 0 && order.type == "Full Trade" ?  (
            <td
              style={{ ...tdStyle, color: 'red', cursor: 'pointer' }}
              onClick={() => {
                cancelTradeOrder(order.trade_id)
              }}
            >
              Cancel
            </td>
          ) : null

        const PlacedOrderTooltip = 'Order is on the exchange order book.'
        const PendingOrderTooltip =
          'Order is waiting to be placed in the order book.'
        return (
          <tr className={rowClass} key={rowIndex}>
            <td style={firstColumnIconStyle}  onClick={rowClick}>{firstColumnIcon}</td>
            <td style={tdStyle}>{order.symbol}</td>
            <td style={tdStyle}>{order.type}</td>
            <td style={sideColumnStyle}>{order.side}</td>
            <td style={hideFirst}>{order.price}</td>
            <td style={hideFirst}>{order.amount}</td>
            <td style={hideFirst}>{order.filled}</td>
            <td style={hideFirst}>
              {order.total} {order.quote_asset}
            </td>
            <td style={hideFirst}>{order.trigger}</td>
            <td style={hideFirst}>
              <div className={styles.customTooltip}>
                {order.status}
                <span className={styles.tooltiptext}>
                  {order.status === 'Pending'
                    ? PendingOrderTooltip
                    : PlacedOrderTooltip}
                </span>
              </div>
            </td>
            <td style={tdStyle}>{ order.timestamp == 0 ? null : <Moment unix format="YYYY-MM-DD hh:mm:ss">{order.timestamp/1000}</Moment>}</td>
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
            ? 'Load Older'
            : 'Nothing more to load'}
        </td>
      </tr>
    </tbody>
  )
}

export default OpenOrdersTableBody
