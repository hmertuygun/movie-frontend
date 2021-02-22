import React, { useEffect, useState, useContext } from 'react'
import { useInfiniteQuery, useQueryClient, useQuery } from 'react-query'
import { isMobile } from 'react-device-detect'
import { getOpenOrders, getOrdersHistory, getExchanges } from '../../../api/api'
import { UserContext } from '../../../contexts/UserContext'
import { firebase } from '../../../firebase/firebase'
import OrderHistoryTableBody from './OrderHistoryTableBody'
import OpenOrdersTableBody from './OpenOrdersTableBody'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './TradeOrders.module.css'
import precisionRound from '../../../helpers/precisionRound'
import { errorNotification } from '../../../components/Notifications'

const OpenOrdersQueryKey = 'OpenOrders'
const OrdersHistoryQueryKey = 'OrdersHistory'

const Table = ({
  isOpenOrders,
  setIsOpenOrders,
  infiniteOrders,
  refreshOpenOrders,
  orderHistoryProgress,
  loadingBtn,
}) => {
  const [isHideOtherPairs, setIsHideOtherPairs] = useState(false)
  const rfshExchange = useQuery('exchangeSymbols', getExchanges, {
    onError: () => {
      console.log(`Couldn't fetch exchanges`)
    },
    refetchOnWindowFocus: false,
  })

  const ProgressBar = (
    <div className="m-5 progress-wrapper">
      <span className="progress-label text-muted">
        Processing Order History..
      </span>
      <span className="progress-percentage text-muted">{`${orderHistoryProgress}%`}</span>
      <div className="mt-2 progress" style={{ height: `8px` }}>
        <div
          className="progress-bar bg-primary"
          role="progressbar"
          style={{ width: `${orderHistoryProgress}%` }}
        ></div>
      </div>
    </div>
  )
  return (
    <div className="d-flex flex-column" style={{ height: '100%' }}>
      <div className="pb-0">
        <div className="flex-wrap d-flex justify-content-between align-items-center">
          <div>
            <span
              className={
                (isOpenOrders ? 'h6 action-item' : 'action-item') + ' pt-3 ml-2'
              }
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
          <div className="col-auto">
            <div className="d-flex justify-content-between align-items-center">
              <div className="mr-5 custom-control custom-checkbox">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="check-terms"
                  checked={isHideOtherPairs}
                  onChange={(e) => setIsHideOtherPairs(e.target.checked)}
                />
                <label
                  className={`custom-control-label ${styles['customControlLabel']}`}
                  htmlFor="check-terms"
                  style={{ fontSize: '12px', verticalAlign: 'middle' }}
                >
                  Hide Other Pairs
                </label>
              </div>
              {loadingBtn ? (
                <button
                  className="btn btn-sm btn-neutral btn-icon"
                  type="button"
                  disabled
                >
                  {!isMobile && (
                    <span className="btn-inner--text">Refresh</span>
                  )}
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm btn-neutral btn-icon"
                  onClick={refreshOpenOrders}
                >
                  {!isMobile && (
                    <span className="btn-inner--text">Refresh</span>
                  )}
                  <span className="btn-inner--icon">
                    <FontAwesomeIcon icon={faSync} />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {!isOpenOrders && orderHistoryProgress !== '100.00' ? (
        ProgressBar
      ) : (
        <div style={{ overflowY: 'scroll' }}>
          <table className={['table', styles.table].join(' ')}>
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">Pair</th>
                <th scope="col">Type</th>
                <th scope="col">Side</th>
                {!isOpenOrders ? <th scope="col">Average</th> : null}
                <th scope="col">Price</th>
                <th scope="col">Amount</th>
                <th scope="col">Filled</th>
                <th scope="col">Total</th>
                <th scope="col">Trigger Condition</th>
                <th scope="col">Status</th>
                <th scope="col">Date</th>
                {isOpenOrders ? <th scope="col">Cancel</th> : null}
              </tr>
            </thead>
            {isOpenOrders ? (
              <OpenOrdersTableBody
                infiniteOrders={infiniteOrders}
                isHideOtherPairs={isHideOtherPairs}
              />
            ) : (
              <OrderHistoryTableBody
                infiniteOrders={infiniteOrders}
                isHideOtherPairs={isHideOtherPairs}
              />
            )}
          </table>
        </div>
      )}
    </div>
  )
}

const TradeOrders = () => {
  const queryClient = useQueryClient()
  const [isOpenOrders, setIsOpenOrders] = useState(true)
  const { activeExchange } = useContext(UserContext)
  const [user, setUser] = useState()
  const [orderHistoryProgress, setOrderHistoryProgress] = useState(0)
  const [fullRefresh, setFullRefresh] = useState(0)
  const [loadBtn, setLoadBtn] = useState(false)
  const [orderUpdateCount, setOrderUpdateCount] = useState(0)

  const infiniteOpenOrders = useInfiniteQuery(
    OpenOrdersQueryKey,
    async ({ pageParam }) => {
      const params = pageParam
        ? {
            timestamp: pageParam.timestamp,
            trade_id: pageParam.trade_id,
            fullRefresh,
            ...activeExchange,
          }
        : { ...activeExchange, fullRefresh }
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
      onError: () => {
        errorNotification.open({ description: 'Error fetching open orders!' })
      },
      refetchOnWindowFocus: false,
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
            ...activeExchange,
          }
        : { ...activeExchange }
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
      onError: () => {
        errorNotification.open({ description: 'Error fetching order history' })
      },
      refetchOnWindowFocus: false,
    }
  )

  firebase.auth().onAuthStateChanged(function (user) {
    if (user != null) {
      setUser(user)
    } else {
      setUser(null)
    }
  })

  useEffect(async () => {
    if (fullRefresh === 1) {
      setLoadBtn(true)
      await infiniteOpenOrders.refetch()
      setFullRefresh(0)
      setLoadBtn(false)
    }
  }, [fullRefresh])

  useEffect(() => {
    infiniteOpenOrders.refetch()
    infiniteHistory.refetch()
  }, [activeExchange])

  useEffect(() => {
    if (user != null) {
      firebase
        .firestore()
        .collection('order_history_load')
        .doc(user.email)
        .onSnapshot(
          { includeMetadataChanges: true },
          function (doc) {
            let fsData = doc.data()
            let total, loaded
            Object.keys(fsData).forEach((item) => {
              if (item.includes('loaded')) {
                loaded = fsData[item]
              } else if (item.includes('total')) {
                total = fsData[item]
              }
            })
            let progress = precisionRound((loaded / total) * 100)
            setOrderHistoryProgress(progress)
          },
          (err) => {
            console.info(err)
          }
        )
      firebase
        .firestore()
        .collection('order_update')
        .doc(user.email)
        .onSnapshot(async function (doc) {
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
      refreshExchanges={getExchanges}
      orderHistoryProgress={orderHistoryProgress}
      refreshOpenOrders={() => setFullRefresh(1)}
      loadingBtn={loadBtn}
    />
  )
}

export default TradeOrders
