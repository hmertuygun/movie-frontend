import React, { useContext } from 'react'

import Tooltip from '../../../components/Tooltip'
import useIntersectionObserver from './useIntersectionObserver'
import Moment from 'react-moment'
import TradeOrdersStyle from './TradeOrders.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSymbolContext } from '../../context/SymbolContext'
import { UserContext } from '../../../contexts/UserContext'
import styles from './TradeOrders.module.css'
const OrderHistoryTableBody = ({
  data,
  isFetching,
  lastFetchedData,
  isHideOtherPairs,
  callOrderHistoryAPI,
  symbolClick
}) => {

  const columns = [
    {
      title: 'Pair',
      key: 'pair',
      dataIndex: 'symbol',
    },
    {
      title: 'Type',
      key: 'type',
      dataIndex: 'type',
    },
    {
      title: 'Side',
      key: 'side',
      dataIndex: 'side',
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
    },
  ]
  const { activeExchange } = useContext(UserContext)
  const { symbolDetails, setSymbol } = useSymbolContext()

  const loadMoreButtonRef = React.useRef()

  useIntersectionObserver({
    target: loadMoreButtonRef,
    onIntersect: callOrderHistoryAPI,
    enabled: lastFetchedData && !isFetching && !isHideOtherPairs,
    threshold: 0.1,
  })

  const { selectedSymbolDetail, symbolType } = useSymbolContext()
  const selectedPair = selectedSymbolDetail['symbolpair']

  const onSymbolClick = (rowIndex, val) => {
    const calcVal = `${activeExchange?.exchange.toUpperCase()}:${val.replace('-', '/')}`
    if (!symbolDetails[calcVal]) return
    setSymbol({ label: val, value: calcVal })
  }

  data = data.filter((order) => {
    if (!isHideOtherPairs) {
      return true
    }
    return order.symbol.replace('-', '/') === symbolType
  })

  return (
    <div
      className="ordersTable"
      style={{
        overflowY: data.length ? 'scroll' : 'hidden',
        overflowX: 'auto',
        marginRight: '-12px',
        paddingBottom: '12px',
      }}
    >
      <table className={['table', styles.table].join(' ')}>
        <thead>
          <tr>
            <th scope="col"></th>
            {columns.map((item) => (
              <th scope="col" key={item.key}>
                {item.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((order, index) => {
            const isCanceled = order.status?.toLowerCase() === 'canceled'
            const rowClass = isCanceled ? TradeOrdersStyle.canceled : ''
            return (
              <tr key={index} className={rowClass}>
                <td></td>
                <td style={{ cursor: 'pointer' }} onClick={() => { onSymbolClick(index, order.symbol) }}>{order.symbol}</td>
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
                    data-for={`order-history-${order.order_id}`}
                    data-tip={order.error}
                  >
                    {order.status}
                  </div>
                  {order.error && (
                    <Tooltip id={`order-history-${order.order_id}`} />
                  )}
                </td>
                <td>
                  <Moment unix format="YYYY-MM-DD HH:mm:ss">
                    {order.update_time / 1000}
                  </Moment>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="text-center" ref={loadMoreButtonRef}>
        {isFetching ? (
          <p className="pt-3">
            <span className="spinner-border text-primary spinner-border-sm" />
          </p>
        ) : null}
      </div>
      <div
        className={`alert alert-secondary text-center mt-5 mx-auto d-none ${!data.length && !isFetching ? 'd-block' : 'd-none'
          }`}
        style={{ maxWidth: '400px' }}
        role="alert"
      >
        <strong>
          <FontAwesomeIcon icon="exclamation-triangle" /> Order history will appear as you trade the markets on CoinPanel
        </strong>
      </div>
    </div>
  )
}

export default OrderHistoryTableBody
