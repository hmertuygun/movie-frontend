import React from 'react'
import useIntersectionObserver from './useIntersectionObserver'
import Moment from 'react-moment'
import TradeOrdersStyle from './TradeOrders.module.css'
import tooltipStyles from '../TradeOrders/tooltip.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSymbolContext } from '../../context/SymbolContext'
import styles from './TradeOrders.module.css'
const OrderHistoryTableBody = ({ data, isFetching, lastFetchedData, isHideOtherPairs, callOrderHistoryAPI }) => {

  const columns = [
    {
      title: 'Pair',
      key: 'pair',
      dataIndex: 'symbol'
    },
    {
      title: 'Type',
      key: 'type',
      dataIndex: 'type'
    },
    {
      title: 'Side',
      key: 'side',
      dataIndex: 'side'
    },
    {
      title: 'Average',
      key: 'average',
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
    }
  ]
  const loadMoreButtonRef = React.useRef()
  useIntersectionObserver({
    target: loadMoreButtonRef,
    onIntersect: callOrderHistoryAPI,
    enabled: lastFetchedData && !isFetching,
    threshold: .1,
  })
  const { selectedSymbolDetail } = useSymbolContext()
  const selectedPair = selectedSymbolDetail['symbolpair']
  data = data.filter((order) => {
    if (!isHideOtherPairs) {
      return true
    }
    return order.symbol.replace('-', '') === selectedPair
  })
  return (
    <div className="ordersTable" style={{ overflowY: data.length ? 'scroll' : 'hidden', overflowX: 'hidden', marginRight: '-12px', paddingBottom: '12px' }}>
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
            data
              .map((order, index) => {
                const isCanceled = order.status?.toLowerCase() === 'canceled'
                const rowClass = isCanceled ? TradeOrdersStyle.canceled : ''
                return (
                  <tr key={index} className={rowClass}>
                    <td></td>
                    <td>{order.symbol}</td>
                    <td>{order.type}</td>
                    <td
                      style={
                        !isCanceled
                          ? {
                            color:
                              order.side?.toLowerCase() === 'buy'
                                ? 'green'
                                : 'red',
                          }
                          : undefined
                      }
                    >
                      {order.side}
                    </td>
                    <td>{order.average}</td>
                    <td>{order.price}</td>
                    <td>{order.amount}</td>
                    <td>{order.filled}</td>
                    <td>{order.total}</td>
                    <td>{order.trigger}</td>
                    <td
                      style={{
                        color: order.error ? 'red' : '',
                      }}
                    >
                      <div
                        className={
                          order.error ? tooltipStyles.customTooltip : ''
                        }
                        style={{ fontSize: '12px' }}
                      >
                        {order.status}
                        <span className={tooltipStyles.tooltiptext}>
                          {order.error}
                        </span>
                      </div>
                    </td>
                    <td>
                      <Moment unix format="YYYY-MM-DD hh:mm:ss">
                        {order.update_time / 1000}
                      </Moment>
                    </td>
                  </tr>
                )
              })
          }
        </tbody>
      </table>
      <div className="text-center" ref={loadMoreButtonRef}>
        {isFetching ? (
          <p className="pt-3">
            <span
              className="spinner-border text-primary spinner-border-sm"
            />
          </p>
        ) : null}
      </div>
      <div className={`alert alert-secondary text-center mt-5 mx-auto d-none ${!data.length && !isFetching ? 'd-block' : 'd-none'}`} style={{ maxWidth: '400px' }} role="alert">
        <strong> <FontAwesomeIcon icon='exclamation-triangle' /> You have no order history.</strong>
      </div>
    </div>
  )
}

export default OrderHistoryTableBody
