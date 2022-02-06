/* eslint-disable css-modules/no-unused-class */
import React, { useContext } from 'react'

import Tooltip from '../../../components/Tooltip'
import useIntersectionObserver from './useIntersectionObserver'
import Moment from 'react-moment'
import TradeOrdersStyle from './TradeOrders.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSymbolContext } from '../../context/SymbolContext'
import { UserContext } from '../../../contexts/UserContext'
import styles from './TradeOrders.module.css'
import { handleChangeTickSize } from '../../../helpers/useTickSize'

const OrderHistoryTableBody = ({
  data,
  isFetching,
  lastFetchedData,
  isHideOtherPairs,
  callOrderHistoryAPI,
  symbolClick,
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

  const { symbolType } = useSymbolContext()

  const onSymbolClick = (rowIndex, val) => {
    const calcVal = `${activeExchange?.exchange.toUpperCase()}:${val.replace(
      '-',
      '/'
    )}`
    if (!symbolDetails[calcVal]) return
    setSymbol({ label: val, value: calcVal })
  }

  const addToolTipBreakPoints = (text) => {
    return text.replaceAll('.', '. <br>')
  }

  const parseErrorToolTip = (text) => {
    if (text.includes('IP banned until')) {
      let date = text.match(/\d/g).join('')
      let formattedDate = new Date(Number(date)).toLocaleString()
      return addToolTipBreakPoints(text.replace(date, formattedDate))
    } else if (
      text.includes(
        'Your trade failed to execute, because you did not have enough available balance.'
      )
    ) {
      return `
      Your trade failed to execute, because you did not have enough available balance. <br> No need to panic. This can be caused by:
      <ul>
      <li>
      You had a SL&TP. One of them triggered and used your balance, so the other one could not execute because you don't have the order amount available.
      </li>
      <li>
      You used the same balance to place multiple orders, one of them triggered and used your balance, therefore not enough left for the second order.
      </li>
      </ul>`
    } else return addToolTipBreakPoints(text)
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
        overflowY: data.length ? 'auto' : 'hidden',
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
          {data &&
            data.map((order, index) => {
              const isCanceled = order?.status?.toLowerCase() === 'canceled'
              const rowClass = isCanceled ? TradeOrdersStyle.canceled : ''
              return (
                <tr key={index} className={rowClass}>
                  <td></td>
                  <td
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      onSymbolClick(index, order.symbol)
                    }}
                  >
                    {order?.symbol}
                  </td>
                  <td>{order?.type}</td>
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
                    {order?.side}
                  </td>
                  <td>
                    {order.average === 'Market'
                      ? order.average
                      : handleChangeTickSize(order.average, order.symbol)}
                  </td>
                  <td>
                    {order.price === 'Market'
                      ? order.price
                      : handleChangeTickSize(order.price, order.symbol)}
                  </td>
                  <td>
                    {handleChangeTickSize(order.amount, order.symbol, true)}
                  </td>
                  <td>
                    {handleChangeTickSize(order.filled, order.symbol, true)}
                  </td>
                  <td>{handleChangeTickSize(order.total, order.symbol)}</td>
                  <td>{order?.trigger}</td>
                  <td
                    style={{
                      color: order?.error ? 'red' : '',
                    }}
                  >
                    <div
                      data-for={`order-history-${order?.order_id}`}
                      data-place={`${
                        order?.error?.length > 75 ? 'left' : 'top'
                      }`}
                      data-tip={parseErrorToolTip(order.error)}
                      data-html={true}
                      data-class={
                        order?.error ? 'order-history-error-tooltip' : ''
                      }
                    >
                      {order?.status}
                    </div>
                    {order.error && (
                      <Tooltip id={`order-history-${order.order_id}`} />
                    )}
                  </td>
                  <td>
                    <Moment unix format="YYYY-MM-DD hh:mm:ss A">
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
        className={`alert alert-secondary text-center mt-5 mx-auto d-none ${
          !data.length && !isFetching ? 'd-block' : 'd-none'
        }`}
        style={{ maxWidth: '500px' }}
        role="alert"
      >
        <strong>
          <FontAwesomeIcon icon="info-circle" /> Order history will appear as
          you trade the markets on CoinPanel.
        </strong>
      </div>
    </div>
  )
}

export default OrderHistoryTableBody
