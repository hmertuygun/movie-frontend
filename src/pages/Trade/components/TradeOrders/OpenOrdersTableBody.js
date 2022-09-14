import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { notify } from 'reapop'
import { useSymbolContext } from 'contexts/SymbolContext'
import { Tooltip, Icon } from 'components'
import { cancelTradeOrder, editOrder } from 'services/api'
import Moment from 'react-moment'
import { ThemeContext } from 'contexts/ThemeContext'
// eslint-disable-next-line css-modules/no-unused-class
import styles from './TradeOrders.module.css'
import OrderEditModal from './OrderEditModal'
import SellOrderEditModal from './OrderEditModal/SellOrderEditModal'
import { handleChangeTickSize } from 'utils/useTickSize'
import { useDispatch, useSelector } from 'react-redux'
import { updateOrderEdited } from 'store/actions'
import { OPEN_ORDER_COLUMNS } from 'constants/OpenOdersColumns'
import MESSAGES from 'constants/Messages'

const Expandable = ({ entry, deletedRow, setDeletedRows }) => {
  const [show, setShow] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const { theme } = useContext(ThemeContext)
  const [cancelOrderRow, setCancelOrderRow] = useState(null)
  const { setSymbol } = useSymbolContext()
  const { symbolDetails } = useSelector((state) => state.symbols)
  const { activeExchange } = useSelector((state) => state.exchanges)
  const dispatch = useDispatch()

  const isFullTrade = entry.length > 2
  const tradeType = entry && entry.find((value) => value.symbol === 'Entry')

  const isSellfullTrade = entry.length > 2 && tradeType.side === 'Sell'

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
      const res = await cancelTradeOrder({
        ...order,
        ...activeExchange,
      })
      if (res?.status === 'error') {
        dispatch(
          res?.data.detail || notify(MESSAGES['order-cancel-failed'], 'error')
        )
      } else {
        setDeletedRows(order.trade_id)
        deletedRow(order)
        dispatch(notify(MESSAGES['order-cancelled'], 'success'))
      }
    } catch (error) {
      dispatch(notify(MESSAGES['order-cancel-failed'], 'error'))
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
      dispatch(notify(MESSAGES['order-edited'], 'success'))
      dispatch(updateOrderEdited(true))
      setEditModalOpen(false)
    } catch (error) {
      const { data } = error.response
      dispatch(notify(data?.detail || MESSAGES['order-edit-failed'], 'error'))
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
            <td style={hideFirst}>
              {order.price === 'Market'
                ? order.price
                : handleChangeTickSize(order.price, order.orderSymbol)}
            </td>
            <td style={hideFirst}>
              {handleChangeTickSize(order.amount, order.orderSymbol)}
            </td>
            <td style={hideFirst}>
              {handleChangeTickSize(order.filled, order.orderSymbol)}
            </td>
            <td style={hideFirst}>
              {handleChangeTickSize(order.total, order.orderSymbol)}{' '}
              {order.quote_asset}
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
        <>
          {isSellfullTrade ? (
            <SellOrderEditModal
              onClose={() => setEditModalOpen(false)}
              onSave={handleOnSave}
              isLoading={editLoading}
              selectedOrder={selectedOrder}
              targetOrders={targetOrders}
              stoplossOrder={stoplossOrder}
              entryOrder={entryOrder}
              isFullTrade={isFullTrade}
            />
          ) : (
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
          )}
        </>
      ) : null}
    </>
  )
}

const OpenOrdersTableBody = ({
  data,
  isHideOtherPairs,
  deleteRow,
  sortColumn,
  isFetching,
}) => {
  const [deletedRows, setDeletedRows] = useState([])
  const [columns, setColumns] = useState(OPEN_ORDER_COLUMNS)

  const { symbolType } = useSelector((state) => state.symbols)

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
    <>
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
        {!isFetching ? (
          <tbody>
            {data.map((item) => {
              const { trade_id, symbol } = item
              const itemData = JSON.parse(JSON.stringify(item))
              // Order Symbol for all orders.
              const orderArray = itemData.orders.map((order) => ({
                trade_id,
                orderSymbol: symbol,
                ...order,
              }))
              // Order ID for Basic Trade
              if (itemData.type !== 'Full Trade') {
                itemData.order_id = itemData.orders[0].order_id
              }
              const orders = [
                { orderSymbol: symbol, ...itemData },
                ...orderArray,
              ]
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
        ) : null}
      </table>
      {isFetching ? (
        <div className="text-center w-100">
          <p className="pt-3">
            <span className="spinner-border text-primary spinner-border-sm" />
          </p>
        </div>
      ) : null}
    </>
  )
}

OpenOrdersTableBody.propTypes = {
  entry: PropTypes.array,
  deletedRow: PropTypes.func,
  setDeletedRows: PropTypes.func,
}

export default OpenOrdersTableBody
