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
import { useSymbolContext } from '../../context/SymbolContext'
const OpenOrdersQueryKey = 'OpenOrders'
const OrdersHistoryQueryKey = 'OrdersHistory'
let FBOrderUpdate = firebase.firestore().collection('order_update')
let FBOrderHistory = firebase.firestore().collection('order_history_update')

const Table = ({
  isOpenOrders,
  setIsOpenOrders,
  tableData,
  refreshOpenOrders,
  orderHistoryProgress,
  loadingBtn,
  showProgressBar
}) => {
  const [isHideOtherPairs, setIsHideOtherPairs] = useState(false)
  const rfshExchange = useQuery('exchangeSymbols', getExchanges, {
    onError: () => {
      console.log(`Couldn't fetch exchanges`)
    },
    refetchOnWindowFocus: false,
  })
  // console.log(showProgressBar)
  // console.log(orderHistoryProgress)
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
              className={`${!isOpenOrders ? 'h6 action-item' : 'action-item'
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
      {!isOpenOrders && showProgressBar ? (
        ProgressBar
      ) : (
          isOpenOrders ?
            <OpenOrdersTableBody
              tableData={tableData}
              isHideOtherPairs={isHideOtherPairs}
            />
            : null
        )
      }
    </div>
  )
}

const TradeOrders = () => {
  const OPEN_ORDERS_INITIAL_STATE = {
    isFetched: false,
    lastFetchedData: null,
    limit: 50,
    page: 0,
    data: []
  }
  const { isLoadingBalance, isOrderPlaced, isOrderCancelled } = useSymbolContext()
  const { activeExchange, setLoaderVisibility } = useContext(UserContext)
  const queryClient = useQueryClient()
  const [isOpenOrders, setIsOpenOrders,] = useState(true)
  const [user, setUser] = useState()
  const [orderHistoryProgress, setOrderHistoryProgress] = useState('100.00')
  const [loadBtn, setLoadBtn] = useState(false)
  const [showProgressBar, setShowProgressBar] = useState(false)
  const [openOrders, setOpenOrders] = useState(OPEN_ORDERS_INITIAL_STATE)

  const getOpenOrdersData = async () => {
    try {
      setOpenOrders({ ...openOrders, isFetched: false })
      const { lastFetchedData, data } = openOrders
      const params = lastFetchedData ? { timestamp: lastFetchedData.timestamp, trade_id: lastFetchedData.trade_id, ...activeExchange } : { ...activeExchange }
      const orders = await getOpenOrders(params)
      if (orders?.items?.length) {
        const { items } = orders
        setOpenOrders({ ...openOrders, data: [...data, ...items], lastFetchedData: items[items.length - 1] })
      }
    }
    catch (e) {
      console.log(`Error Fetching Open Orders`)
      errorNotification.open({ description: 'Error fetching open orders!' })
    }
    finally {
      setOpenOrders({ ...openOrders, isFetched: true })
    }
  }

  getOpenOrders()
  // let infiniteOpenOrders = useInfiniteQuery(
  //   OpenOrdersQueryKey,
  //   async ({ pageParam }) => {
  //     const params = pageParam
  //       ? {
  //         timestamp: pageParam.timestamp,
  //         trade_id: pageParam.trade_id,
  //         ...activeExchange,
  //       }
  //       : { ...activeExchange }
  //     const orders = await getOpenOrders(params)
  //     return orders.items
  //   },
  //   {
  //     getPreviousPageParam: (firstPage) => {
  //       return firstPage[0]
  //     },
  //     getNextPageParam: (lastPage) => {
  //       return lastPage[lastPage.length - 1]
  //     },
  //     onError: () => {
  //       errorNotification.open({ description: 'Error fetching open orders!' })
  //     },
  //     refetchOnWindowFocus: false
  //   }
  // )

  let infiniteHistory = useInfiniteQuery(
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
      refetchOnWindowFocus: false
    },
  )

  firebase.auth().onAuthStateChanged(function (user) {
    if (user != null) {
      setUser(user)
    } else {
      setUser(null)
    }
  })

  const onRefreshBtnClick = async () => {
    // setLoadBtn(true)
    // await Promise.allSettled([infiniteOpenOrders.refetch(), infiniteHistory.refetch()])
    // setLoadBtn(false)
  }

  // useEffect(async () => {
  //   let ordersTable = document.querySelector(".ordersTable")
  //   if (ordersTable) {
  //     ordersTable.scrollTo(0, 0)
  //   }
  //   setOrderHistoryProgress('100.00')
  //   setShowProgressBar(false)
  //   await Promise.allSettled([infiniteOpenOrders.refetch(), infiniteHistory.refetch()])
  // }, [activeExchange])

  // useEffect(async () => {
  //   if (isOrderPlaced || isOrderCancelled) {
  //     onRefreshBtnClick()
  //   }
  // }, [isOrderPlaced, isOrderCancelled])

  // useEffect(() => {
  //   if (infiniteHistory.isFetched && infiniteOpenOrders.isFetched && !isLoadingBalance) {
  //     setLoaderVisibility(false)
  //   }
  // }, [isLoadingBalance, infiniteOpenOrders.isFetched, infiniteHistory.isFetched])

  const callOpenOrdersKey = () => {
    let showProgbar = sessionStorage.getItem('showProgressBar')
    if (!showProgbar) {
      console.log('Open Orders Func called')
      queryClient.invalidateQueries(OpenOrdersQueryKey)
    }
  }
  const callOrderHistory = () => {
    let showProgbar = sessionStorage.getItem('showProgressBar')
    if (!showProgbar) {
      console.log('History Update Func called')
      queryClient.invalidateQueries(OrdersHistoryQueryKey)
    }
  }

  // useEffect(() => {
  //   if (user != null) {
  //     const unsubFBHistoryLoad = firebase
  //       .firestore()
  //       .collection('order_history_load')
  //       .doc(user.email)
  //       .onSnapshot(
  //         function (doc) {
  //           // console.log(doc.data())
  //           // If the api key name and exchange name coming from firestore is the currently selected one, only then show progress bar
  //           let total = 0, loaded = 0
  //           let totalSelected = false, loadedSelected = false
  //           // console.log(activeExchange)
  //           Object.entries(doc.data())
  //             .sort()
  //             .forEach(([item, no]) => {
  //               let [apiName, exchange] = item.split("__")
  //               exchange = exchange.split("_")[0]
  //               // console.log(apiName, exchange)
  //               let isActiveExchangeSelected = activeExchange.apiKeyName === apiName && activeExchange.exchange === exchange
  //               if (isActiveExchangeSelected && item.includes("loaded")) {
  //                 loaded = no
  //                 totalSelected = true
  //               }
  //               if (isActiveExchangeSelected && item.includes("total")) {
  //                 total = no
  //                 loadedSelected = true
  //               }
  //             })
  //           //console.log(total, loaded, totalSelected, loadedSelected)
  //           let progress = precisionRound((loaded / total) * 100)
  //           setShowProgressBar(loadedSelected && totalSelected && progress !== '100.00')
  //           sessionStorage.setItem('showProgressBar', loadedSelected && totalSelected && progress !== '100.00')
  //           setOrderHistoryProgress(progress)
  //         },
  //         (err) => {
  //           console.error(err)
  //         }
  //       )
  //     const unsubFBOrderUpdate = firebase
  //       .firestore()
  //       .collection('order_update')
  //       .doc(user.email)
  //       .onSnapshot((doc) => {
  //         queryClient.invalidateQueries(OrdersHistoryQueryKey)
  //       })
  //     const unsubFBOrderHistoryUpdate = firebase
  //       .firestore()
  //       .collection('order_history_update')
  //       .doc(user.email)
  //       .onSnapshot((doc) => {
  //         console.log(`Order History Update`)
  //         queryClient.invalidateQueries(OrdersHistoryQueryKey)
  //       })

  //     return () => {
  //       unsubFBHistoryLoad()
  //       unsubFBOrderUpdate()
  //       unsubFBOrderHistoryUpdate()
  //     }
  //   }
  // }, [queryClient, user])


  return (
    <Table
      isOpenOrders={isOpenOrders}
      setIsOpenOrders={setIsOpenOrders}
      tableData={isOpenOrders ? openOrders : infiniteHistory}
      refreshExchanges={getExchanges}
      orderHistoryProgress={orderHistoryProgress}
      refreshOpenOrders={onRefreshBtnClick}
      loadingBtn={loadBtn}
      showProgressBar={showProgressBar}
    />
  )
}

export default TradeOrders
