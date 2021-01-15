import React, { useEffect, useState } from 'react'
import { useInfiniteQuery, useQueryClient } from 'react-query'
import { getOpenOrders, getOrdersHistory } from '../../../api/api'
import { firebase } from '../../../firebase/firebase'
import OrderHistoryTableBody from './OrderHistoryTableBody'
import OpenOrdersTableBody from './OpenOrdersTableBody'

const OpenOrdersQueryKey = 'OpenOrders'
const OrdersHistoryQueryKey = 'OrdersHistory'

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

const TradeOrders = () => {
  const queryClient = useQueryClient()
  const [isOpenOrders, setIsOpenOrders] = useState(true)
  const infiniteOpenOrders = useInfiniteQuery(
    OpenOrdersQueryKey,
    async ({ pageParam }) => {
      console.log('OpenOrders pageParam', pageParam)
      const params = pageParam
        ? {
            timestamp: pageParam.timestamp,
            trade_id: pageParam.trade_id,
          }
        : {}
      const orders = await getOpenOrders(params)
      return orders.items
    },
    {
      getPreviousPageParam: (firstPage) => {
        return firstPage[0]
      },
      getNextPageParam: (lastPage) => {
        return lastPage[lastPage.length - 1]
      },
    }
  )

  const infiniteHistory = useInfiniteQuery(
    OrdersHistoryQueryKey,
    async ({ pageParam }) => {
      console.log('OrdersHistory pageParam', pageParam)
      const params = pageParam
        ? {
            updateTime: pageParam.update_time,
            symbol: pageParam.symbol,
            orderId: pageParam.order_id,
          }
        : {}
      const orders = await getOrdersHistory(params)
      return orders.items
    },
    {
      getPreviousPageParam: (firstPage) => {
        return firstPage[0]
      },
      getNextPageParam: (lastPage) => {
        return lastPage[lastPage.length - 1]
      },
    }
  )

  useEffect(() => {
    firebase
      .firestore()
      .collection('order_update')
      .doc('jtest@test.com')
      .onSnapshot(function (doc) {
        queryClient.invalidateQueries(OpenOrdersQueryKey)
        console.log('order_update Current data: ', doc.data())
      })
    firebase
      .firestore()
      .collection('order_history_update')
      .doc('jtest@test.com')
      .onSnapshot(function (doc) {
        queryClient.invalidateQueries(OrdersHistoryQueryKey)
        console.log('order_history_update Current data: ', doc.data())
      })
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
