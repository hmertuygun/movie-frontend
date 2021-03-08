import React, { useEffect, useState, useContext, useCallback } from 'react'
import { useInfiniteQuery, useQueryClient, useQuery } from 'react-query'
import { useMediaQuery } from 'react-responsive';

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
import './TradeOrders.css'
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
  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` });
  const { isLoadingBalance, isOrderPlaced, isOrderCancelled, refreshBalance } = useSymbolContext()
  const { activeExchange, loaderVisible, setLoaderVisibility, userData, totalExchanges, setUserData } = useContext(UserContext)
  const [isOpenOrders, setIsOpenOrders,] = useState(true)
  const [orderHistoryProgress, setOrderHistoryProgress] = useState('100.00')
  const [loadBtn, setLoadBtn] = useState(false)
  const [showProgressBar, setShowProgressBar] = useState(false)
  const [isHideOtherPairs, setIsHideOtherPairs] = useState(false)
  const [deletedRows, setDeletedRows] = useState(null)
  const [orderUpdateFB, setOrderUpdateFB] = useState(0)
  const [orderHistoryFB, setOrderHistoryFB] = useState(0)
  const [keyProcessing, setKeyProcessing] = useState(false)
  /////////////////////////////////////////////////////////
  const [openOrderData, setOpenOrderData] = useState([])
  const [isOpenOrderFetching, setIsOpenOrderFetching] = useState(true)
  const [openOrdersLastFetchedData, setOpenOrdersLastElement] = useState(null)
  const openOrdersLimit = 50
  ////////////////////////////////////////////////////////
  const [orderHistoryData, setOrderHistoryData] = useState([])
  const [isOrderHistoryFetching, setIsOrderHistoryFetching] = useState(false)
  const [orderHistoryLastFetchedData, setOrderHistoryLastElement] = useState(null)
  const orderHistoryLimit = 50
  ////////////////////////////////////////////////////////
  const [cancelOrder, setCancelOrder] = useState(false)
  const [openOrderError, setOpenOrderError] = useState(false)
  let FBOrderUpdate, FBOrderHistory, FBOrderHistoryLoad

  const getOpenOrdersData = (refBtn) => {
    if (deletedRows) return
    if (refBtn) setLoadBtn(true)
    setIsOpenOrderFetching(true)
    getOpenOrders({ ...activeExchange, limit: openOrdersLimit })
      .then(res => {
        const temp = res.items
        temp.sort((a, b) => b.timestamp - a.timestamp)
        setOpenOrderData([...temp])
        setOpenOrderError(false)
      })
      .catch(e => {
        console.log(e)
        setOpenOrderData([])
        setOpenOrderError(true)
      })
      .then(() => {
        setIsOpenOrderFetching(false)
        setLoadBtn(false)
      })
  }

  const getOrderHistoryData = async (refreshTable, hideTableLoader, refBtn) => {
    try {
      if (isOrderHistoryFetching) return
      if (refBtn) setLoadBtn(true)
      if (refreshTable) setOrderHistoryData([])
      if (!hideTableLoader) setIsOrderHistoryFetching(true)
      const params = refreshTable ? { ...activeExchange, orderHistoryLimit } : orderHistoryLastFetchedData && !refreshTable ? {
        updateTime: orderHistoryLastFetchedData.update_time,
        symbol: orderHistoryLastFetchedData.symbol,
        orderId: orderHistoryLastFetchedData.order_id,
        orderHistoryLimit,
        ...activeExchange
      } : { ...activeExchange, orderHistoryLimit }

      const orders = await getOrdersHistory(params)
      if (orders?.items?.length) {
        let slicedItems = refreshTable ? orders.items : orderHistoryLastFetchedData && !refreshTable ? orders.items.slice(1) : orders.items
        if (refreshTable) {
          setOrderHistoryData([...slicedItems])
        }
        else {
          setOrderHistoryData(prevState => [...prevState, ...slicedItems])
        }
        setOrderHistoryLastElement(slicedItems.length < orderHistoryLimit - 1 ? null : slicedItems[slicedItems.length - 1])
      }
      else {
        setOrderHistoryLastElement(null)
      }
    }
    catch (e) {
      console.log(`Error Fetching History Orders`)
      setOrderHistoryData([])
      errorNotification.open({ description: 'Error fetching order history!', duration: 3, key: "order_history" })
    }
    finally {
      setIsOrderHistoryFetching(false)
      setLoadBtn(false)
    }
  }

  const onRefreshBtnClick = () => {
    if (isOpenOrders) getOpenOrdersData(true)
    else getOrderHistoryData(true, false, true)
  }

  const orderHistoryLoadedFBCallback = (doc) => {
    //console.log(console.log('Order History Loaded => ', doc.data()))
    if (!doc?.data()) return
    let isActiveExchangeSelected = false
    let loaded = 0, total = 0
    let isSomeKeyProcessing = false
    // Loop through FB object and see if some key is in processing. e.g: loaded != total
    let keyArr = Object.entries(doc.data()).sort()
    for (let i = 0; i < keyArr.length; i += 2) {
      let [item, no] = keyArr[i] // loaded
      let [item1, no1] = keyArr[i + 1] //total
      let [apiName, exchange] = item.split("__")
      exchange = exchange.split("_")[0]
      if (!isSomeKeyProcessing) {
        let inTotalExchanges = totalExchanges.find(item => item.apiKeyName === apiName && item.exchange === exchange)
        if (inTotalExchanges && no !== no1) {
          isSomeKeyProcessing = true
        }
      }
      if (!isActiveExchangeSelected) {
        isActiveExchangeSelected = activeExchange.apiKeyName === apiName && activeExchange.exchange === exchange
        if (isActiveExchangeSelected) {
          loaded = no
          total = no1
        }
      }
    }
    setKeyProcessing(isSomeKeyProcessing)
    if (isActiveExchangeSelected) {
      let progress = precisionRound((loaded / total) * 100)
      setOrderHistoryProgress(progress)
      setShowProgressBar(progress !== '100.00')
      sessionStorage.setItem('showProgressBar', progress !== '100.00')
    }
  }

  const deleteOpenOrdersRow = (row) => {
    setDeletedRows(row)
    // setCancelOrder(true)
    // setTimeout(() => {
    //   setCancelOrder(false)
    // }, 3000)
    // let arrData = [...openOrderData]
    // let dIndex = arrData.findIndex(item => item.trade_id === row.trade_id)
    // arrData.splice(dIndex, 1)
    // setOpenOrderData(arrData)
    refreshBalance()
  }

  useEffect(() => {
    let timeOut
    if (deletedRows) {
      let arrData = [...openOrderData]
      let dIndex = arrData.findIndex(item => item.trade_id === deletedRows.trade_id)
      if (dIndex !== -1) {
        arrData.splice(dIndex, 1)
        setOpenOrderData([...arrData])
      }
      timeOut = setTimeout(() => {
        setDeletedRows(null)
      }, 3000)
    }
    return () => {
      clearTimeout(timeOut)
    }
  }, [deletedRows])

  const setStateSynchronous = (setState, stateUpdate) => {
    return new Promise(resolve => {
      setState(stateUpdate, () => resolve())
    })
  }

  useEffect(() => {
    if (orderHistoryFB > 0 && !showProgressBar) getOrderHistoryData(true, false)
  }, [orderHistoryFB, showProgressBar])

  useEffect(() => {
    if (orderUpdateFB > 0) getOpenOrdersData()
  }, [orderUpdateFB])

  useEffect(() => {
    // if (orderUpdateFB > 0) setOrderUpdateFB(0)
    // if (orderHistoryFB > 0) setOrderHistoryFB(0)
    setOrderHistoryProgress('100.00')
    setShowProgressBar(false)
    // setOpenOrderData([])
    // setOrderHistoryData([])

    FBOrderUpdate = db.collection('order_update')
      .doc(userData.email)
      .onSnapshot((doc) => {
        console.log('Order Update at => ', new Date())
        setOrderUpdateFB(prevState => prevState + 1)
      })

    FBOrderHistory = db.collection('order_history_update')
      .doc(userData.email)
      .onSnapshot((doc) => {
        console.log('Order History Update at => ', new Date())
        setOrderHistoryFB(prevState => prevState + 1)
      })

    FBOrderHistoryLoad = db.collection('order_history_load')
      .doc(userData.email)
      .onSnapshot(
        orderHistoryLoadedFBCallback,
        (err) => {
          console.error(err)
        }
      )

    return () => {
      FBOrderUpdate()
      FBOrderHistory()
      FBOrderHistoryLoad()
    }
  }, [activeExchange])

  useEffect(() => {
    if (!isLoadingBalance && !isOpenOrderFetching && !isOrderHistoryFetching) {
      setLoaderVisibility(false)
    }
  }, [isLoadingBalance, isOpenOrderFetching, isOrderHistoryFetching])

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
              Open Orders({openOrderData.length})
            </span>
            <span
              className={`${!isOpenOrders ? 'h6 action-item' : 'action-item'
                } pl-4`}
              onClick={() => setIsOpenOrders(false)}
            >
              Order History({orderHistoryData.length})
            </span>
          </div>
          <div className="col-auto">
            <div className="d-flex justify-content-between align-items-center">
              <div className="mr-5 custom-control custom-checkbox d-flex align-items-center">
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
                  style={{ fontSize: '12px', verticalAlign: 'middle', lineHeight: 'unset' }}
                >
                  Hide Other Pairs
                </label>
              </div>
              {(
                <button
                  className="btn btn-xs btn-neutral btn-icon"
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
              }
            </div>
          </div>
        </div>
      </div>
      {
        isOpenOrders ? (
          <OpenOrdersTableBody
            data={openOrderData}
            deleteRow={(rData) => deleteOpenOrdersRow(rData)}
            isHideOtherPairs={isHideOtherPairs}
          />
        ) : !isOpenOrders && showProgressBar ? ProgressBar : (
          <OrderHistoryTableBody
            isFetching={isOrderHistoryFetching}
            lastFetchedData={orderHistoryLastFetchedData}
            data={orderHistoryData}
            callOrderHistoryAPI={() => getOrderHistoryData()}
            isHideOtherPairs={isHideOtherPairs}
          />
        )
      }
      {
        isOpenOrders &&
        <div className="open-orders-msg d-flex flex-wrap justify-content-center">
          {
            isOpenOrderFetching && <div className="text-center pt-3">
              <span className="spinner-border text-primary spinner-border-sm" />
            </div>
          }
          {!openOrderData.length && !isOpenOrderFetching && <div className={`alert alert-secondary text-center mt-4`} style={{ width: '400px' }} role="alert">
            <strong><FontAwesomeIcon icon='exclamation-triangle' /> You have no open orders.</strong>
          </div>
          }
          {!isOpenOrderFetching && openOrderError && <div className={`alert alert-danger text-center mt-4`} style={{ width: '400px' }} role="alert">
            <strong><FontAwesomeIcon icon='times-circle' /> Failed to get open orders.</strong>
          </div>
          }
        </div>
      }
    </div>
  )
}

export default TradeOrders
