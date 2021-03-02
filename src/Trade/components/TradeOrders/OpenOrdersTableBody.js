import React, { useState, useContext, useEffect } from 'react'
import { cancelTradeOrder } from '../../../api/api'
import { Icon } from '../../../components'
import useIntersectionObserver from './useIntersectionObserver'
import tooltipStyles from './tooltip.module.css'
import Moment from 'react-moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { UserContext } from '../../../contexts/UserContext'
import {
  errorNotification,
  successNotification,
} from '../../../components/Notifications'
import { useSymbolContext } from '../../context/SymbolContext'
import styles from './TradeOrders.module.css'

const deleteDuplicateRows = (data, key) => {
  if (!data?.length) return []
  const uniqueData = Array.from(new Set(data.map(a => a[key]))).map(id => data.find(a => a[key] === id))
  return uniqueData
}

const Expandable = ({ entry, deletedRow }) => {
  const [show, setShow] = useState(false)
  const { activeExchange } = useContext(UserContext)
  const [cancelOrderRow, setCancelOrderRow] = useState(null)
  const onCancelOrderClick = async (order, index) => {
    setCancelOrderRow({ ...order })
    try {
      await cancelTradeOrder({
        ...order,
        ...activeExchange,
      })
      deletedRow(order)
      successNotification.open({ description: `Order Cancelled!` })
    } catch (error) {
      errorNotification.open({
        description: `Order couldn't be cancelled. Please try again later`,
      })
    }
    finally {
      setCancelOrderRow(null)
    }
  }
  return (
    <>
      { entry.map((order, rowIndex) => {
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
          rowIndex === 0 ? (
            <td
              style={{ ...tdStyle, color: 'red', cursor: 'pointer' }}
              onClick={() => { onCancelOrderClick(order) }}
            >
              Cancel
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

const OpenOrdersTableBody = ({ tableData, isHideOtherPairs, callOpenOrdersAPI }) => {
  const loadMoreButtonRef = React.useRef()
  let { isFetching, lastFetchedData, data } = tableData
  const [deletedRows, setDeletedRows] = useState([])
  const columns = [
    {
      title: 'Pair',
      key: 'pair',
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
      key: 'date',
    },
    {
      title: 'Cancel',
      key: 'cancel',
    },
  ]
  useIntersectionObserver({
    target: loadMoreButtonRef,
    onIntersect: callOpenOrdersAPI,
    enabled: lastFetchedData && !isFetching,
    threshold: .1
  })
  const { selectedSymbolDetail } = useSymbolContext()
  const selectedPair = selectedSymbolDetail['symbolpair']
  console.log(data)
  // const [renderData, setRenderData] = useState(tableData.data)
  // useEffect(() => {
  //   setRenderData(tableData.data)
  // }, [tableData])

  // useEffect(() => {
  //   let filteredData = renderData.filter((order) => {
  //     if (!isHideOtherPairs) {
  //       return true
  //     }
  //     return order.symbol.replace('-', '') === selectedPair
  //   })
  //   setRenderData(filteredData)
  // }, [isHideOtherPairs])

  const deleteRow = (row) => {
    setDeletedRows([...deletedRows, row])
    // let arrData = [...renderData]
    // let dIndex = arrData.findIndex(item => item.trade_id === row.trade_id)
    // arrData.splice(dIndex, 1)
    // setRenderData(arrData)
  }
  data = data.filter(item => deletedRows.findIndex(item1 => item.trade_id === item1.trade_id) < 0)
  data = data.filter((order) => {
    if (!isHideOtherPairs) {
      return true
    }
    return order.symbol.replace('-', '') === selectedPair
  })
  return (
    <div className="ordersTable" style={{ overflowY: data.length ? 'scroll' : 'hidden', overflowX: 'hidden' }}>
      <table className={['table', styles.table].join(' ')}>
        <thead>
          <tr>
            <th scope="col"></th>
            {
              columns.map((item) => (
                <th scope="col" key={item.key}>{item.title}</th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          {
            data && data.map((item, index) => {
              const orders = [item, ...item.orders]
              return (
                <Expandable
                  entry={orders}
                  key={index}
                  deletedRow={(row) => deleteRow(row)}
                />
              )
            })
          }
          <tr ref={loadMoreButtonRef}>
            <td colSpan="12">
              {isFetching ? (
                <p className="pt-3">
                  <span
                    className="spinner-border text-primary spinner-border-sm"
                  />
                </p>
              ) : null}
            </td>
          </tr>
        </tbody>
      </table>
      <div className={`alert alert-secondary text-center mt-5 mx-auto d-none ${!data.length && !isFetching ? 'd-block' : 'd-none'}`} style={{ maxWidth: '400px' }} role="alert">
        <strong> <FontAwesomeIcon icon='exclamation-triangle' /> Nothing to show!</strong>
      </div>
    </div>
  )
}

export default OpenOrdersTableBody
