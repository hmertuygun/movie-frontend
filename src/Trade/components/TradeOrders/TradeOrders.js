import React, { useEffect, useState } from 'react'
import { useInfiniteQuery, useQueryClient } from 'react-query'
import { getOpenOrders, getOrdersHistory } from '../../../api/api'
import { firebase } from '../../../firebase/firebase'
import OrderHistoryTableBody from './OrderHistoryTableBody'
import OpenOrdersTableBody from './OpenOrdersTableBody'
import { UserContext } from '../../../contexts/UserContext'

const OpenOrdersQueryKey = 'OpenOrders'
const OrdersHistoryQueryKey = 'OrdersHistory'

const Table = ({ isOpenOrders, setIsOpenOrders, infiniteOrders }) => {
  return (
    <div className="d-flex flex-column" style={{ height: '100%' }}>
      <div className="card-header pb-0">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span
              className={isOpenOrders ? 'h6 action-item' : 'action-item'}
              onClick={() => setIsOpenOrders(true)}
            >
              Open Orders
            </span>
            <span
              className={`${
                !isOpenOrders ? 'h6 action-item' : 'action-item'
              } pl-4`}
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
            
          </div>
        </div>
      </div>
      <div className="card-body" style={{ overflowY: 'scroll' }}>
        <table className="table">
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col">Pair</th>
              <th scope="col">Type</th>
              <th scope="col">Side</th>
              <th scope="col">Price</th>
              <th scope="col">Amount</th>
              <th scope="col">Filled</th>
              <th scope="col">Total</th>
              <th scope="col">Trigger Condition</th>
              <th scope="col">Status</th>
              <th scope="col">Date</th>
              <th scope="col">Cancel</th>
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
  const [user, setUser] = useState()
  const infiniteOpenOrders = useInfiniteQuery(
    OpenOrdersQueryKey,
    async ({ pageParam }) => {
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

  firebase.auth().onAuthStateChanged(function (user) {
    if (user != null) {
      setUser(user)
    } else {
      setUser(null)
    }
  })

  useEffect(() => {
    if (user != null) {
      firebase
        .firestore()
        .collection('order_update')
        .doc(user.email)
        .onSnapshot(function (doc) {
          queryClient.invalidateQueries(OpenOrdersQueryKey)
        })
      firebase
        .firestore()
        .collection('order_history_update')
        .doc(user.email)
        .onSnapshot(function (doc) {
          queryClient.invalidateQueries(OrdersHistoryQueryKey)
        })
    }
  }, [queryClient, user])
  return (
    <Table
      isOpenOrders={isOpenOrders}
      setIsOpenOrders={setIsOpenOrders}
      infiniteOrders={isOpenOrders ? infiniteOpenOrders : infiniteHistory}
    />
  )
}

export default TradeOrders
