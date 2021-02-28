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
import { ref } from 'yup'
const db = firebase.firestore()

const OPEN_ORDERS_INITIAL_STATE = {
  isFetching: false,
  lastFetchedData: null,
  limit: 50,
  page: 1,
  data: []
}
const ORDER_HISTORY_INITIAL_STATE = {
  isFetching: false,
  lastFetchedData: null,
  limit: 50,
  page: 1,
  data: []
}

const TradeOrders = () => {
  const { isLoadingBalance, isOrderPlaced, isOrderCancelled } = useSymbolContext()
  const { activeExchange, loaderVisible, setLoaderVisibility, userData, totalExchanges, setUserData } = useContext(UserContext)
  const [isOpenOrders, setIsOpenOrders,] = useState(true)
  const [orderHistoryProgress, setOrderHistoryProgress] = useState('100.00')
  const [loadBtn, setLoadBtn] = useState(false)
  const [showProgressBar, setShowProgressBar] = useState(false)
  const [openOrders, setOpenOrders] = useState(OPEN_ORDERS_INITIAL_STATE)
  const [orderHistory, setOrderHistory] = useState(ORDER_HISTORY_INITIAL_STATE)
  const [isHideOtherPairs, setIsHideOtherPairs] = useState(false)
  const [orderUpdateFB, setOrderUpdateFB] = useState(0)
  const [orderHistoryFB, setOrderHistoryFB] = useState(0)
  const [keyProcessing, setKeyProcessing] = useState(false)
  const openOrdersInterval = 3000
  const orderHistoryInterval = 30000
  let FBOrderUpdate, FBOrderHistory, FBOrderHistoryLoad, openOrderPolling, orderHistoryPolling

  const getOpenOrdersData = async (refBtn, hideTableLoader) => {
    try {
      if (openOrders.isFetching) return
      if (refBtn) {
        setOpenOrders(prevState => ({ ...prevState, lastFetchedData: null }))
      }
      if (!hideTableLoader) setOpenOrders(prevState => ({ ...prevState, isFetching: true }))
      const { lastFetchedData, limit } = openOrders
      const params = lastFetchedData ? { timestamp: lastFetchedData.timestamp, trade_id: lastFetchedData.trade_id, limit, ...activeExchange } : { ...activeExchange, limit }
      const orders = await getOpenOrders(params)
      if (orders?.items?.length) {
        const { items } = orders
        let slicedItems = lastFetchedData ? items.slice(1) : items
        if (refBtn) {
          setOpenOrders(prevState => ({ ...prevState, data: [...slicedItems], lastFetchedData: slicedItems[slicedItems.length - 1] }))
        }
        else {
          setOpenOrders(prevState => ({ ...prevState, data: [...prevState.data, ...slicedItems], lastFetchedData: slicedItems[slicedItems.length - 1] }))
        }
        if (slicedItems.length < limit) {
          setOpenOrders(prevState => ({ ...prevState, lastFetchedData: null }))
        }
      }
      else {
        setOpenOrders(prevState => ({ ...prevState, lastFetchedData: null }))
      }
    }
    catch (e) {
      console.log(`Error Fetching Open Orders`)
      errorNotification.open({ description: 'Error fetching open orders!' })
    }
    finally {
      setOpenOrders(prevState => ({ ...prevState, isFetching: false }))
    }
  }

  const getOrderHistoryData = async (refBtn, hideTableLoader) => {
    try {
      if (orderHistory.isFetching) return
      if (refBtn) {
        setOrderHistory(prevState => ({ ...prevState, lastFetchedData: null }))
      }
      if (!hideTableLoader) setOrderHistory(prevState => ({ ...prevState, isFetching: true }))
      const { lastFetchedData, limit } = orderHistory
      const params = refBtn ? { ...activeExchange, limit } : lastFetchedData && !refBtn ? {
        updateTime: lastFetchedData.update_time,
        symbol: lastFetchedData.symbol,
        orderId: lastFetchedData.order_id,
        limit,
        ...activeExchange
      } : { ...activeExchange, limit }

      const orders = await getOrdersHistory(params)
      if (orders?.items?.length) {
        const { items } = orders
        let slicedItems = refBtn ? items : lastFetchedData && !refBtn ? items.slice(1) : items
        if (refBtn) {
          setOrderHistory(prevState => ({ ...prevState, data: [...slicedItems], lastFetchedData: slicedItems[slicedItems.length - 1] }))
        }
        else {
          setOrderHistory(prevState => ({ ...prevState, data: [...prevState.data, ...slicedItems], lastFetchedData: slicedItems[slicedItems.length - 1] }))
        }
        if (slicedItems.length < limit) {
          setOrderHistory(prevState => ({ ...prevState, lastFetchedData: null }))
        }
      }
      else {
        setOrderHistory(prevState => ({ ...prevState, lastFetchedData: null }))
      }
    }
    catch (e) {
      console.log(`Error Fetching History Orders`)
      errorNotification.open({ description: 'Error fetching order history!' })
    }
    finally {
      setOrderHistory(prevState => ({ ...prevState, isFetching: false }))
    }
  }

  const onRefreshBtnClick = () => {
    setLoadBtn(true)
    if (isOpenOrders) getOpenOrdersData(true, false)
    else getOrderHistoryData(true, false)
    setLoadBtn(false)
  }

  const orderHistoryLoadedFBCallback = (doc) => {
    console.log(console.log('Order History Loaded => ', doc.data()))
    let isActiveExchangeSelected = false
    // Loop through FB object and see if some key is in processing. e.g: loaded != total
    let keyArr = Object.entries(doc.data()).sort()
    for (let i = 0; i < keyArr.length; i += 2) {
      let [item, no] = keyArr[i] // loaded
      let [item1, no1] = keyArr[i + 1] //total
      let [apiName, exchange] = item.split("__")
      exchange = exchange.split("_")[0]
      isActiveExchangeSelected = activeExchange.apiKeyName === apiName && activeExchange.exchange === exchange
      if (isActiveExchangeSelected) {
        let progress = precisionRound((no / no1) * 100)
        setOrderHistoryProgress(progress)
        setShowProgressBar(progress !== '100.00')
        sessionStorage.setItem('showProgressBar', progress !== '100.00')
        break
      }
    }
  }

  // useEffect(() => {
  //   if (orderUpdateFB > 0 && !keyProcessing) getOpenOrdersData(false, true)
  // }, [orderUpdateFB, keyProcessing])

  // useEffect(() => {
  //   if (orderHistoryFB > 0 && !showProgressBar && !keyProcessing) getOrderHistoryData(false, true)
  // }, [orderHistoryFB, showProgressBar, keyProcessing])

  // useEffect(() => {
  //   if (!showProgressBar) {
  //     getOrderHistoryData(false, true)
  //   }
  // }, [showProgressBar])

  useEffect(() => {
    console.log(`In active exchange`)
    // setOrderHistory(ORDER_HISTORY_INITIAL_STATE)
    // setOpenOrders(OPEN_ORDERS_INITIAL_STATE)
    setOrderHistoryProgress('100.00')
    setShowProgressBar(false)
    getOpenOrdersData(true, false)
    getOrderHistoryData(true, false)
    openOrderPolling = setInterval(() => getOpenOrdersData(true, true), openOrdersInterval)
    orderHistoryPolling = setInterval(() => getOrderHistoryData(true, true), orderHistoryInterval)

    // FBOrderUpdate = db.collection('order_update')
    //   .doc(userData.email)
    //   .onSnapshot((doc) => {
    //     console.log('Order Update => ', orderUpdateFB)
    //     setOrderUpdateFB(prevState => prevState + 1)
    //   })

    // FBOrderHistory = db.collection('order_history_update')
    //   .doc(userData.email)
    //   .onSnapshot((doc) => {
    //     console.log('Order History Update => ', orderHistoryFB)
    //     setOrderHistoryFB(prevState => prevState + 1)
    //   })

    FBOrderHistoryLoad = db.collection('order_history_load')
      .doc(userData.email)
      .onSnapshot(
        orderHistoryLoadedFBCallback,
        (err) => {
          console.error(err)
        }
      )

    return () => {
      // FBOrderUpdate()
      // FBOrderHistory()
      clearInterval(openOrderPolling)
      clearInterval(orderHistoryPolling)
      FBOrderHistoryLoad()
    }
  }, [activeExchange])

  useEffect(() => {
    if (!isLoadingBalance) {
      setLoaderVisibility(false)
    }
  }, [isLoadingBalance])

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
      <div className="pb-2">
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
              {(
                <button
                  className="btn btn-xs btn-outline-primary btn-icon"
                  type="button"
                  onClick={onRefreshBtnClick}
                  disabled={loadBtn}
                >
                  {!isMobile && (
                    <span className="btn-inner--text">Refresh</span>
                  )}
                  {
                    loadBtn ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    ) : (
                        <span className="btn-inner--icon">
                          <FontAwesomeIcon icon={faSync} />
                        </span>
                      )
                  }
                </button>
              )
                // ) : (
                //     <button
                //       type="button"
                //       className="btn btn-xs btn-outline-primary btn-icon"
                //       onClick={onRefreshBtnClick}
                //     >
                //       {!isMobile && (
                //         <span className="btn-inner--text">Refresh</span>
                //       )}
                //       <span className="btn-inner--icon">
                //         <FontAwesomeIcon icon={faSync} />
                //       </span>
                //     </button>
                //   )
              }
            </div>
          </div>
        </div>
      </div>
      {
        isOpenOrders ? (
          <OpenOrdersTableBody
            tableData={openOrders}
            callOpenOrdersAPI={() => getOpenOrdersData()}
            isHideOtherPairs={isHideOtherPairs}
          />
        ) : !isOpenOrders && showProgressBar ? ProgressBar : (
          <OrderHistoryTableBody
            tableData={orderHistory}
            callOrderHistoryAPI={() => getOrderHistoryData()}
            isHideOtherPairs={isHideOtherPairs}
          />
        )
      }
    </div>
  )
}

export default TradeOrders
