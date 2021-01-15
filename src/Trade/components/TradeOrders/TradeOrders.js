import React, { useEffect, useState } from 'react'
import { useInfiniteQuery, useQuery } from 'react-query'
import { getOpenOrders, getOrdersHistory } from '../../../api/api'
import { firebase } from '../../../firebase/firebase'
import { Icon } from '../../../components'
import OrderHistoryTableBody from './OrderHistoryTableBody'
import OpenOrdersTableBody from './OpenOrdersTableBody'

function useIntersectionObserver({
  root,
  target,
  onIntersect,
  threshold = 1.0,
  rootMargin = '0px',
  enabled = true,
}) {
  React.useEffect(() => {
    if (!enabled) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => entry.isIntersecting && onIntersect()),
      {
        root: root && root.current,
        rootMargin,
        threshold,
      }
    )

    const el = target && target.current

    if (!el) {
      return
    }

    observer.observe(el)

    return () => {
      observer.unobserve(el)
    }
  }, [target.current, enabled])
}

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

const Table = ({ isOpenOrders, setIsOpenOrders, infiniteOrders }) => {
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
  // useIntersectionObserver({
  //   target: loadMoreButtonRef,
  //   onIntersect: fetchNextPage,
  //   enabled: hasNextPage,
  // })
  return (
    <div className="d-flex flex-column" style={{ height: '100%' }}>
      <div className="card-header pb-0">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span
              className={isOpenOrders ? 'h6 ' : ''}
              onClick={() => setIsOpenOrders(true)}
            >
              Open Orders
            </span>
            <span
              className={`${!isOpenOrders ? 'h6' : ''} pl-4`}
              onClick={() => setIsOpenOrders(false)}
            >
              Order History
            </span>
          </div>
          <div>
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="flexCheckDefault"
            />
            <span className="pr-4">Hide Other Pairs</span>X
          </div>
        </div>
      </div>
      <div className="card-body" style={{ overflowY: 'scroll' }}>
        <table className="table">
          <thead>
            <tr>
              {TableHeaderFields.map((field) => (
                <th scope="col" key={field}>
                  {field}
                </th>
              ))}
            </tr>
          </thead>
          {isOpenOrders ? (
            <OpenOrdersTableBody infiniteOrders={infiniteOrders} />
          ) : (
            <OrderHistoryTableBody infiniteOrders={infiniteOrders} />
          )}
        </table>
      </div>
    </div>
  )
}

const MapOpenOrdersToTable = (order) => {
  return [
    [
      [
        <Icon icon="chevron-down" />,
        order.symbol,
        order.type,
        order.side,
        order.price,
        order.amount,
        order.filled,
        order.total,
        order.trigger,
        order.status,
        order.timestamp,
      ],
      ...order.orders.map((order) => [
        '',
        order.symbol,
        order.type,
        order.side,
        order.price,
        order.amount,
        order.filled,
        order.total,
        order.trigger,
        order.status,
      ]),
    ],
  ]
}

const MapOrdersHistoryToTable = (order) => {
  return [
    '',
    order.symbol,
    order.type,
    order.side,
    order.price,
    order.amount,
    order.filled,
    order.total,
    order.trigger,
    order.status,
    order.update_time,
  ]
}

const TradeOrders = () => {
  const [isOpenOrders, setIsOpenOrders] = useState(true)
  const infiniteOpenOrders = useInfiniteQuery(
    'OpenOrders',
    async ({ pageParam = 0 }) => {
      const orders = await getOpenOrders(pageParam)
      const mappedOrders = orders.items.map(MapOpenOrdersToTable)
      return mappedOrders
    },
    {
      getPreviousPageParam: (firstPage) => {
        return firstPage[0][0][10]
      },
      getNextPageParam: (lastPage) => {
        return lastPage[lastPage.length - 1][0][10]
      },
    }
  )

  const infiniteHistory = useInfiniteQuery(
    'OrdersHistory',
    async ({ pageParam = 0 }) => {
      const orders = await getOrdersHistory(pageParam)

      const mappedOrders = orders.items.map(MapOrdersHistoryToTable)
      return mappedOrders
    },
    {
      getPreviousPageParam: (firstPage) => {
        return firstPage[0][10]
      },
      getNextPageParam: (lastPage) => {
        return lastPage[lastPage.length - 1][10]
      },
    }
  )

  useEffect(() => {
    firebase
      .firestore()
      .collection('order_history')
      .doc('BTCRUB-48756762')
      .onSnapshot(function (doc) {
        console.log('order_history Current data: ', doc.data())
      })
    firebase
      .firestore()
      .collection('order_history_update')
      .doc('jtest@test.com')
      .onSnapshot(function (doc) {
        console.log('order_history_update Current data: ', doc.data())
      })
    // .get()
    // .then(function (doc) {
    //   if (doc.exists) {
    //     console.log('Document data:', doc.data())
    //   } else {
    //     // doc.data() will be undefined in this case
    //     console.log('No such document!')
    //   }
    // })
    // .catch(function (error) {
    //   console.log('Error getting document:', error)
    // })
  }, [])
  return (
    <Table
      isOpenOrders={isOpenOrders}
      setIsOpenOrders={setIsOpenOrders}
      infiniteOrders={isOpenOrders ? infiniteOpenOrders : infiniteHistory}
    />
  )
}

export default TradeOrders
