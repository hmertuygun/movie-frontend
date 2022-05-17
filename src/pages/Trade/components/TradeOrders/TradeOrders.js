import React, { useEffect, useState, useContext } from 'react'
import { useMediaQuery } from 'react-responsive'
import { useNotifications } from 'reapop'

import {
  getOpenOrders,
  getOrdersHistory,
  getSnapShotDocument,
} from 'services/api'
import { UserContext } from 'contexts/UserContext'
import { PortfolioContext } from 'contexts/PortfolioContext'
import OrderHistoryTableBody from './OrderHistoryTableBody'
import OpenOrdersTableBody from './OpenOrdersTableBody'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './TradeOrders.module.css'
import precisionRound from 'utils/precisionRound'
import Tooltip from 'components/Tooltip'
import { useSymbolContext } from 'contexts/SymbolContext'
import './TradeOrders.css'

const TradeOrders = () => {
  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` })
  const {
    isLoadingBalance,
    refreshBalance,
    onRefreshBtnClicked,
    disableOrderHistoryRefreshBtn,
    disableOpenOrdersRefreshBtn,
    orderHistoryTimeInterval,
    openOrdersTimeInterval,
    exchangeType,
  } = useSymbolContext()
  const {
    activeExchange,
    setLoaderVisibility,
    userData,
    totalExchanges,
    setOrderHistoryProgressUC,
    setOpenOrdersUC,
    setDelOpenOrders,
    orderEdited,
    setOrderEdited,
    isOnboardingSkipped,
  } = useContext(UserContext)
  const { loading: isPortfolioLoading } = useContext(PortfolioContext)
  const { notify } = useNotifications()

  const [isOpenOrders, setIsOpenOrders] = useState(true)
  const [orderHistoryProgress, setOrderHistoryProgress] = useState('100.00')
  const [loadBtnOO, setLoadBtnOO] = useState(false)
  const [loadBtnOH, setLoadBtnOH] = useState(false)
  const [showProgressBar, setShowProgressBar] = useState(false)
  const [isHideOtherPairs, setIsHideOtherPairs] = useState(false)
  const [deletedRows, setDeletedRows] = useState(null)
  const [orderUpdateFB, setOrderUpdateFB] = useState(0)
  const [orderHistoryFB, setOrderHistoryFB] = useState(0)
  const [keyProcessing, setKeyProcessing] = useState(false)
  // const [openOrdersBtnHover, setOpenOrdersBtnHover] = useState(false)
  /////////////////////////////////////////////////////////
  const [openOrderData, setOpenOrderData] = useState([])
  const [isOpenOrderFetching, setIsOpenOrderFetching] = useState(true)
  // const [openOrdersLastFetchedData, setOpenOrdersLastElement] = useState(null)
  const openOrdersLimit = 50
  ////////////////////////////////////////////////////////
  const [orderHistoryData, setOrderHistoryData] = useState([])
  const [isOrderHistoryFetching, setIsOrderHistoryFetching] = useState(false)
  const [orderHistoryLastFetchedData, setOrderHistoryLastElement] =
    useState(null)
  const orderHistoryLimit = 50
  ////////////////////////////////////////////////////////
  // const [cancelOrder, setCancelOrder] = useState(false)
  const [openOrderError, setOpenOrderError] = useState(false)
  let FBOrderUpdate, FBOrderHistory, FBOrderHistoryLoad

  const getOpenOrdersData = (refBtn) => {
    if (deletedRows) return
    if (refBtn) setLoadBtnOO(true)
    setIsOpenOrderFetching(true)
    getOpenOrders({ ...activeExchange, limit: openOrdersLimit })
      .then((res) => {
        const temp = res.items
        temp.sort((a, b) => b.timestamp - a.timestamp)
        setOpenOrderData([...temp])
        setOpenOrderError(false)
      })
      .catch((e) => {
        console.log(e)
        // notify({
        //   id: 'open-orders-error',
        //   status: 'error',
        //   title: 'Error',
        //   message:
        //     'Error fetching open orders! Your API key may expired, please check your API keys.',
        // })
        setOpenOrderData([])
        setOpenOrderError(true)
      })
      .then(() => {
        setIsOpenOrderFetching(false)
        setLoadBtnOO(false)
      })
  }

  // const setDummyOOData = async () => {
  //   let dummyData = [...dummyOpenOrderData]
  //   setOpenOrderData([...dummyOpenOrderData])
  //   await new Promise((resolve) => {
  //     setTimeout(resolve, 5500)
  //   })
  //   // dummyData[0].orders[0].status = "Filled"
  //   // dummyData[0].orders[1].status = "Filled"
  //   setOpenOrderData([...dummyData])
  // }

  const getOrderHistoryData = async (refreshTable, hideTableLoader, refBtn) => {
    try {
      if (isOrderHistoryFetching) return
      if (refBtn) setLoadBtnOH(true)
      if (refreshTable) setOrderHistoryData([])
      if (!hideTableLoader) setIsOrderHistoryFetching(true)
      const params = refreshTable
        ? { ...activeExchange, orderHistoryLimit }
        : orderHistoryLastFetchedData && !refreshTable
        ? {
            updateTime: orderHistoryLastFetchedData.update_time,
            orderHistoryLimit,
            ...activeExchange,
          }
        : { ...activeExchange, orderHistoryLimit }

      const orders = await getOrdersHistory(params)
      if (orders?.items?.length) {
        let slicedItems = refreshTable
          ? orders.items
          : orderHistoryLastFetchedData && !refreshTable
          ? orders.items.slice(1)
          : orders.items
        if (refreshTable) {
          setOrderHistoryData([...slicedItems])
        } else {
          setOrderHistoryData((prevState) => [...prevState, ...slicedItems])
        }
        setOrderHistoryLastElement(
          slicedItems.length < orderHistoryLimit - 1
            ? null
            : slicedItems[slicedItems.length - 1]
        )
      } else {
        setOrderHistoryLastElement(null)
      }
    } catch (e) {
      console.log(`Error Fetching History Orders`)
      setOrderHistoryData([])
      notify({
        id: 'order-history-error',
        status: 'error',
        title: 'Error',
        message: 'Error fetching order history!',
      })
    } finally {
      setIsOrderHistoryFetching(false)
      setLoadBtnOH(false)
    }
  }

  const onOrdersRefreshBtnClick = (type) => {
    if (type === 'open-order') {
      onRefreshBtnClicked('open-order')
      getOpenOrdersData(true)
    } else if (type === 'order-history') {
      onRefreshBtnClicked('order-history')
      getOrderHistoryData(true, false, true)
    }
  }

  const orderHistoryLoadedFBCallback = (doc) => {
    //console.log(console.log('Order History Loaded => ', doc.data()))
    if (!doc?.data()) return
    let isActiveExchangeSelected = false
    let loaded = 0,
      total = 0
    let isSomeKeyProcessing = false
    // Loop through FB object and see if some key is in processing. e.g: loaded != total
    let keyArr = Object.entries(doc.data()).sort()
    for (let i = 0; i < keyArr.length; i += 2) {
      let [item, no] = keyArr[i] // loaded
      let [item1, no1] = keyArr[i + 1] //total
      let [apiName, exchange] = item.split('__')
      exchange = exchange.split('_')[0]
      if (!isSomeKeyProcessing) {
        let inTotalExchanges = totalExchanges.find(
          (item) => item.apiKeyName === apiName && item.exchange === exchange
        )
        if (inTotalExchanges && no !== no1) {
          isSomeKeyProcessing = true
        }
      }
      if (!isActiveExchangeSelected) {
        isActiveExchangeSelected =
          activeExchange.apiKeyName === apiName &&
          activeExchange.exchange === exchange
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
      setOrderHistoryProgressUC(progress)
      setShowProgressBar(progress !== '100.00')
      if (progress !== '100') {
        onRefreshBtnClicked('order-history')
        onRefreshBtnClicked('portfolio')
      }
      sessionStorage.setItem('showProgressBar', progress !== '100.00')
    }
  }

  const deleteOpenOrdersRow = (row) => {
    setDeletedRows(row)
    setDelOpenOrders(row)
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
      let dIndex = arrData.findIndex(
        (item) => item.trade_id === deletedRows.trade_id
      )
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

  useEffect(() => {
    if (
      orderHistoryFB > 0 &&
      !showProgressBar &&
      !keyProcessing &&
      !isOnboardingSkipped
    ) {
      getOrderHistoryData(true, false)
    }
  }, [orderHistoryFB, showProgressBar])

  useEffect(() => {
    if (orderEdited) {
      getOpenOrdersData()
      setOrderEdited(false)
    }
    if (orderUpdateFB > 0) getOpenOrdersData()
  }, [orderUpdateFB, orderEdited])

  useEffect(() => {
    // if (orderUpdateFB > 0) setOrderUpdateFB(0)
    // if (orderHistoryFB > 0) setOrderHistoryFB(0)
    setOrderHistoryProgress('100.00')
    setOrderHistoryProgressUC('100.00')
    setShowProgressBar(false)
    // setOpenOrderData([])
    // setOrderHistoryData([])

    FBOrderUpdate = getSnapShotDocument(
      'order_update',
      userData.email
    ).onSnapshot((doc) => {
      setOrderUpdateFB((prevState) => prevState + 1)
    })

    FBOrderHistory = getSnapShotDocument(
      'order_history_update',
      userData.email
    ).onSnapshot((doc) => {
      setOrderHistoryFB((prevState) => prevState + 1)
    })

    FBOrderHistoryLoad = getSnapShotDocument('load', userData.email).onSnapshot(
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
    if (
      !isLoadingBalance &&
      !isOpenOrderFetching &&
      !isOrderHistoryFetching &&
      !isPortfolioLoading
    ) {
      setLoaderVisibility(false)
    }
  }, [
    isLoadingBalance,
    isOpenOrderFetching,
    isOrderHistoryFetching,
    isPortfolioLoading,
  ])

  useEffect(() => {
    setOpenOrdersUC(openOrderData)
    refreshBalance()
  }, [openOrderData])

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

  const refreshButtons = isOpenOrders ? (
    <div>
      {/* globalEventOff="click" isCapture={false} */}
      {(disableOpenOrdersRefreshBtn || loadBtnOO) && (
        <Tooltip id="open-orders" />
      )}
      <button
        className={`btn btn-xs btn-neutral btn-icon btn-neutral-disable ${
          disableOpenOrdersRefreshBtn || loadBtnOO ? 'disabled' : ''
        }`}
        type="button"
        data-for="open-orders"
        data-tip={`You can only use this button every ${
          openOrdersTimeInterval / 1000
        } seconds`}
        onClick={() =>
          disableOpenOrdersRefreshBtn || loadBtnOO
            ? null
            : onOrdersRefreshBtnClick('open-order')
        }
      >
        {!isMobile && <span className="btn-inner--text">Refresh</span>}
        {loadBtnOO ? (
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
        ) : (
          <span className="btn-inner--icon">
            <FontAwesomeIcon icon={faSync} />
          </span>
        )}
      </button>
    </div>
  ) : (
    <div>
      {(disableOrderHistoryRefreshBtn || loadBtnOH) && (
        <Tooltip id="order-history" />
      )}
      <button
        className={`btn btn-xs btn-neutral btn-icon btn-neutral-disable ${
          disableOrderHistoryRefreshBtn || loadBtnOH ? 'disabled' : ''
        }`}
        type="button"
        onClick={() =>
          disableOrderHistoryRefreshBtn || loadBtnOH
            ? null
            : onOrdersRefreshBtnClick('order-history')
        }
        data-for="order-history"
        data-tip={`You can only use this button every ${
          orderHistoryTimeInterval / 1000
        } seconds`}
      >
        {!isMobile && <span className="btn-inner--text">Refresh</span>}
        {loadBtnOH ? (
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
        ) : (
          <span className="btn-inner--icon">
            <FontAwesomeIcon icon={faSync} />
          </span>
        )}
      </button>
    </div>
  )

  const sortTable = (key, type, orderVal) => {
    let tempData = [...openOrderData]
    if (type === 'number') {
      tempData.sort((a, b) =>
        orderVal === 0 ? a[key] - b[key] : b[key] - a[key]
      )
    } else if (type === 'alphabet') {
      tempData.sort((a, b) =>
        orderVal === 0
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key])
      )
    }
    setOpenOrderData(() => [...tempData])
  }

  return (
    <div className="d-flex flex-column" style={{ height: '100%' }}>
      <div className="pb-2">
        <div className="flex-wrap d-flex justify-content-between align-items-center">
          <div className="action-item-container">
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
            {/* { !isOpenOrders && 
              <span className='message pl-4'>
                Order history sometimes does not update properly. We are aware of the issue and it will be fixed soon.
              </span>
            } */}
          </div>
          <div className="col-auto">
            <div className="d-flex justify-content-between align-items-center">
              <div className="mr-5 custom-control custom-checkbox d-flex align-items-center">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="check-terms-pairs"
                  checked={isHideOtherPairs}
                  onChange={(e) => setIsHideOtherPairs(e.target.checked)}
                />
                <label
                  className={`custom-control-label ${styles['customControlLabel']}`}
                  htmlFor="check-terms-pairs"
                  style={{
                    fontSize: '12px',
                    verticalAlign: 'middle',
                    lineHeight: 'unset',
                  }}
                >
                  Hide Other Pairs
                </label>
              </div>
              {refreshButtons}
            </div>
          </div>
        </div>
      </div>
      {isOpenOrders ? (
        <OpenOrdersTableBody
          data={openOrderData}
          sortColumn={sortTable}
          deleteRow={(rData) => deleteOpenOrdersRow(rData)}
          isHideOtherPairs={isHideOtherPairs}
          isFetching={isOpenOrderFetching}
        />
      ) : (
        // ) : !isOpenOrders && showProgressBar ? ProgressBar : (
        <OrderHistoryTableBody
          isFetching={isOrderHistoryFetching}
          lastFetchedData={orderHistoryLastFetchedData}
          data={orderHistoryData}
          callOrderHistoryAPI={() => getOrderHistoryData()}
          isHideOtherPairs={isHideOtherPairs}
        />
      )}
      {isOpenOrders && (
        <div className="open-orders-msg d-flex flex-wrap justify-content-center">
          {/* {isOpenOrderFetching && (
            <div className="text-center pt-3">
              <span className="spinner-border text-primary spinner-border-sm" />
            </div>
          )} */}
          {!openOrderData.length && !isOpenOrderFetching && !openOrderError && (
            <div style={{ fontSize: '12px', color: 'rgb(174, 180, 188)' }}>
              You have no open orders.
            </div>
          )}
          {!isOpenOrderFetching && openOrderError && (
            <div
              className={`alert alert-danger text-center mt-4`}
              style={{ width: '400px' }}
              role="alert"
            >
              <strong>
                <FontAwesomeIcon icon="times-circle" /> Failed to get open
                orders.
              </strong>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TradeOrders