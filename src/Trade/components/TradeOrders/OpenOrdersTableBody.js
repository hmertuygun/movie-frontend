import React, { useState, useContext } from 'react'
import { useSymbolContext } from '../../context/SymbolContext'
import Tooltip from '../../../components/Tooltip'
import { cancelTradeOrder, editOrder } from '../../../api/api'
import { Icon } from '../../../components'
import Moment from 'react-moment'
import { UserContext } from '../../../contexts/UserContext'
import { ThemeContext } from '../../../contexts/ThemeContext'
import {
  errorNotification,
  successNotification,
} from '../../../components/Notifications'
// eslint-disable-next-line css-modules/no-unused-class
import styles from './TradeOrders.module.css'
import OrderEditModal from './OrderEditModal'

const openOrdersColumns = [
  {
    title: 'Pair',
    key: 'symbol',
    type: 'alphabet',
    order: 0,
  },
  {
    title: 'Type',
    key: 'type',
  },
  {
    title: 'Side',
    key: 'side',
  },
  {
    title: 'Price',
    key: 'price',
  },
  {
    title: 'Amount',
    key: 'amount',
  },
  {
    title: 'Filled',
    key: 'filled',
  },
  {
    title: 'Total',
    key: 'total',
  },
  {
    title: 'Trigger Condition',
    key: 'trigger-conditions',
  },
  {
    title: 'Status',
    key: 'status',
  },
  {
    title: 'Date',
    key: 'timestamp',
    type: 'number',
    order: 1,
  },
  {
    title: 'Edit',
    key: 'edit',
  },
  {
    title: 'Cancel',
    key: 'cancel',
  },
]

const Expandable = ({ entry, deletedRow, setDeletedRows }) => {
  const [show, setShow] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const { activeExchange, setOrderEdited } = useContext(UserContext)
  const { theme } = useContext(ThemeContext)
  const [cancelOrderRow, setCancelOrderRow] = useState(null)
  const { symbolDetails, setSymbol } = useSymbolContext()

  const isFullTrade = entry.length > 2
  const entryOrder = isFullTrade ? entry?.[1] : null
  const targetOrders = isFullTrade
    ? entry.filter(
        (entry) =>
          entry.label.includes('Target') && !entry.type.includes('Full Trade')
      )
    : null
  const stoplossOrder = isFullTrade ? entry?.[2] : null

  const onCancelOrderClick = async (order) => {
    setCancelOrderRow({ ...order })
    try {
      const { data } = await cancelTradeOrder({
        ...order,
        ...activeExchange,
      })
      if (data?.status === 'error') {
        errorNotification.open({
          description:
            data?.error ||
            `Order couldn't be cancelled. Please try again later.`,
        })
      } else {
        setDeletedRows(order.trade_id)
        deletedRow(order)
        successNotification.open({ description: `Order Cancelled!` })
      }
    } catch (error) {
      errorNotification.open({
        description: `Order couldn't be cancelled. Please try again later.`,
      })
    } finally {
      setCancelOrderRow(null)
    }
  }

  const onSymbolClick = (rowIndex, val) => {
    if (rowIndex !== 0) return
    const calcVal = `${activeExchange.exchange.toUpperCase()}:${val.replace(
      '-',
      '/'
    )}`
    if (!symbolDetails[calcVal]) return
    setSymbol({ label: val, value: calcVal })
  }

  const handleEdit = async (order) => {
    setSelectedOrder(order)
    setEditModalOpen(true)
  }

  const handleOnSave = async (formData) => {
    try {
      setEditLoading(true)
      const { order_id } = selectedOrder
      const payload = {}
      payload.order_id = order_id
      if (formData.triggerPrice) {
        payload.trigger = formData.triggerPrice
      }
      if (formData.price) {
        payload.price = formData.price
      }
      await editOrder(payload)
      successNotification.open({ description: `Order Edited!` })
      setOrderEdited(true)
      setEditModalOpen(false)
    } catch (error) {
      const { data } = error.response
      errorNotification.open({
        description:
          data?.detail || `Order couldn't be edited. Please try again later.`,
      })
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <>
      {entry.map((order, rowIndex) => {
        const tdStyle =
          rowIndex === 1
            ? { border: 0 }
            : rowIndex === 0
            ? { cursor: 'pointer' }
            : undefined
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
          color:
            order.side?.toLowerCase() === 'buy'
              ? theme === 'DARK'
                ? '#58AB58'
                : 'green'
              : theme === 'DARK'
              ? '#D23D3D'
              : 'red',
        }
        const hideFirst = {
          ...tdStyle,
          color:
            rowIndex === 0 && order.type === 'Full Trade' && show
              ? 'transparent'
              : undefined,
        }

        // eslint-disable-next-line no-unused-vars
        const editColumn =
          order.status === 'Pending' && order.type !== 'LIMIT' ? (
            order.type === 'Full Trade' ? (
              rowIndex !== 0 ? (
                <td
                  style={{ ...tdStyle, cursor: 'pointer' }}
                  onClick={() => handleEdit(order)}
                >
                  Edit
                </td>
              ) : (
                <td style={tdStyle}></td>
              )
            ) : (
              <td
                style={{ ...tdStyle, cursor: 'pointer' }}
                onClick={() => handleEdit(order)}
              >
                Edit
              </td>
            )
          ) : (
            <td style={tdStyle}></td>
          )

        const cancelColumn =
          rowIndex === 0 ? (
            <td
              style={{
                ...tdStyle,
                color: theme === 'DARK' ? '#D23D3D' : 'red',
                cursor: 'pointer',
              }}
              onClick={() =>
                cancelOrderRow?.trade_id === order.trade_id
                  ? null
                  : onCancelOrderClick(order)
              }
            >
              {cancelOrderRow?.trade_id === order.trade_id ? '' : 'Cancel'}
              {cancelOrderRow?.trade_id === order.trade_id ? (
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
        const FilledorderTooltip = 'Order is filled.'

        return (
          <tr className={rowClass} key={rowIndex}>
            <td style={firstColumnIconStyle} onClick={rowClick}>
              {firstColumnIcon}
            </td>
            <td
              style={tdStyle}
              onClick={() => {
                onSymbolClick(rowIndex, order.symbol)
              }}
            >
              {order.symbol}
            </td>
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
              <div
                data-for={`open-orders-${order.trade_id}`}
                data-tip={
                  order.status?.toLowerCase() === 'pending'
                    ? PendingOrderTooltip
                    : order.status?.toLowerCase() === 'filled'
                    ? FilledorderTooltip
                    : PlacedOrderTooltip
                }
              >
                {order.status}
              </div>
              <Tooltip id={`open-orders-${order.trade_id}`} />
            </td>
            <td style={tdStyle}>
              {order.timestamp === 0 ? null : (
                <Moment unix format="YYYY-MM-DD hh:mm:ss A">
                  {order.timestamp / 1000}
                </Moment>
              )}
            </td>
            {editColumn}
            {cancelColumn}
          </tr>
        )
      })}
      {editModalOpen ? (
        <OrderEditModal
          onClose={() => setEditModalOpen(false)}
          onSave={handleOnSave}
          isLoading={editLoading}
          selectedOrder={selectedOrder}
          targetOrders={targetOrders}
          stoplossOrder={stoplossOrder}
          entryOrder={entryOrder}
          isFullTrade={isFullTrade}
        />
      ) : null}
    </>
  )
}

const OpenOrdersTableBody = ({
  data,
  isHideOtherPairs,
  deleteRow,
  sortColumn,
}) => {
  const [deletedRows, setDeletedRows] = useState([])
  const [columns, setColumns] = useState(openOrdersColumns)

  const { symbolType } = useSymbolContext()

  const onTableHeadClick = (key, type, index) => {
    if (!type) return
    let tempColumnData = [...columns]
    let columnData = tempColumnData[index]
    tempColumnData[index].order = Math.abs(columnData.order - 1)
    sortColumn(key, type, tempColumnData[index].order)
    setColumns([...tempColumnData])
  }

  data = data
    .filter((order) => {
      if (!isHideOtherPairs) {
        return true
      }
      return order.symbol.replace('-', '/') === symbolType
    })
    .filter((order) => {
      return !deletedRows.includes(order.trade_id)
    })

  return (
    <div
      style={{
        minHeight: '90px',
        overflowY: data.length ? 'scroll' : 'hidden',
        overflowX: 'auto',
      }}
    >
      <table className={['table', styles.table].join(' ')}>
        <thead>
          <tr>
            <th scope="col"></th>
            {columns.map((item, index) => (
              <th
                scope="col"
                key={item.key}
                onClick={() => onTableHeadClick(item.key, item?.type, index)}
              >
                {/* item?.type === 'alphabet' ? sortColumn(item.key, item.type, index) : item?.type === 'number' ? sortColumn(item.key, item.type, index) : null */}
                {item.title}{' '}
                {item?.type &&
                  (item.order === 0 ? (
                    <span className="fa fa-sort-amount-up-alt" />
                  ) : item.order === 1 ? (
                    <span className="fa fa-sort-amount-down" />
                  ) : null)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const { trade_id, symbol } = item
            // Order Symbol for all orders.
            const orderArray = item.orders.map((order) => ({
              trade_id,
              orderSymbol: symbol,
              ...order,
            }))
            // Order ID for Basic Trade
            if (item.type !== 'Full Trade') {
              item.order_id = item.orders[0].order_id
            }
            const orders = [{ orderSymbol: symbol, ...item }, ...orderArray]
            return (
              <Expandable
                entry={orders}
                key={item.trade_id}
                setDeletedRows={(row) => {
                  setDeletedRows((rows) => [...rows, row])
                  setTimeout(() => {
                    setDeletedRows((rows) => rows.splice(0, 1))
                  }, 3600000)
                }}
                deletedRow={(row) => deleteRow(row)}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default OpenOrdersTableBody
