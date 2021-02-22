import React, { useState, useContext } from 'react'
import { cancelTradeOrder } from '../../../api/api'
import { Icon } from '../../../components'
import useIntersectionObserver from './useIntersectionObserver'
import tooltipStyles from './tooltip.module.css'
import Moment from 'react-moment'
import { UserContext } from '../../../contexts/UserContext'
import {
  errorNotification,
  successNotification,
} from '../../../components/Notifications'
import { useSymbolContext } from '../../context/SymbolContext'

const Expandable = ({ entry, cancelingOrders, setCancelingOrders }) => {
  const [show, setShow] = useState(false)
  const { activeExchange } = useContext(UserContext)
  return (
    <>
      {entry.map((order, rowIndex) => {
        const isLoading = cancelingOrders.find(
          (cancelingOrder) => cancelingOrder === order.trade_id
        )
        const tdStyle = rowIndex === 1 ? { border: 0 } : undefined
        const rowClass = rowIndex > 0 ? `collapse ${show ? 'show' : ''}` : ''
        const rowClick = () => {
          if (order.type === 'Full Trade') setShow(!show)
        }
        const firstColumnIconStyle = rowIndex !== 0 ? { border: 0 } : undefined
        const firstColumnIcon =
          rowIndex === 0 && order.type === 'Full Trade' ? (
            <Icon icon={`chevron-${show ? 'down' : 'right'}`} />
          ) : null
        const sideColumnStyle = {
          ...tdStyle,
          color: order.side?.toLowerCase() === 'buy' ? 'green' : 'red',
        }
        const hideFirst = {
          ...tdStyle,
          color:
            rowIndex === 0 && order.type === 'Full Trade' && show
              ? 'transparent'
              : undefined,
        }
        const cancelColumn =
          rowIndex === 0 && order.type === 'Full Trade' ? (
            <td
              style={{ ...tdStyle, color: 'red', cursor: 'pointer' }}
              onClick={async () => {
                setCancelingOrders([...cancelingOrders, order.trade_id])
                try {
                  await cancelTradeOrder({
                    trade_id: order.trade_id,
                    ...activeExchange,
                  })
                  successNotification.open({ description: `Order Cancelled!` })
                } catch (error) {
                  const restOfCancelOrders = cancelingOrders.filter(
                    (cancelingOrder) => cancelingOrder !== order.trade_id
                  )
                  errorNotification.open({
                    description: `Order couldn't be cancelled. Please try again later`,
                  })
                  setCancelingOrders(restOfCancelOrders)
                  throw error
                }
              }}
            >
              Cancel
              {isLoading ? (
                <span
                  className="ml-2 spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : null}
            </td>
          ) : null

        const PlacedOrderTooltip = 'Order is on the exchange order book.'
        const PendingOrderTooltip =
          'Order is waiting to be placed in the order book.'
        return (
          <tr className={rowClass} key={rowIndex}>
            <td style={firstColumnIconStyle} onClick={rowClick}>
              {firstColumnIcon}
            </td>
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
              <div className={tooltipStyles.customTooltip}>
                {order.status}
                <span className={tooltipStyles.tooltiptext}>
                  {order.status?.toLowerCase() === 'pending'
                    ? PendingOrderTooltip
                    : PlacedOrderTooltip}
                </span>
              </div>
            </td>
            <td style={tdStyle}>
              {order.timestamp === 0 ? null : (
                <Moment unix format="YYYY-MM-DD hh:mm:ss">
                  {order.timestamp / 1000}
                </Moment>
              )}
            </td>
            {cancelColumn}
          </tr>
        )
      })}
    </>
  )
}

const OpenOrdersTableBody = ({ infiniteOrders, isHideOtherPairs }) => {
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
  const { selectedSymbolDetail } = useSymbolContext()
  const selectedPair = selectedSymbolDetail['symbolpair']

  const [cancelingOrders, setCancelingOrders] = useState([])
  return (
    <tbody>
      {history &&
        history.pages.map((items, index) => (
          <React.Fragment key={index}>
            {items
              .filter((order) => {
                if (!isHideOtherPairs) {
                  return true
                }
                return order.symbol.replace('-', '') === selectedPair
              })
              .map((order, rowIndex) => {
                const orders = [order, ...order.orders]
                return (
                  <Expandable
                    entry={orders}
                    key={rowIndex}
                    cancelingOrders={cancelingOrders}
                    setCancelingOrders={setCancelingOrders}
                  />
                )
              })}
          </React.Fragment>
        ))}
      <tr ref={loadMoreButtonRef}>
        <td colSpan="12">
          {isFetchingNextPage
            ? 'Loading more...'
            : hasNextPage
            ? 'Load Older'
            : 'No open orders'}
        </td>
      </tr>
    </tbody>
  )
}

export default OpenOrdersTableBody
