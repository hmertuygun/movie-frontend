/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useCallback, useState, useEffect } from 'react'
import Tooltip from '../components/Tooltip'
import DropDownSelect from 'react-dropdown-select'
import Select from 'react-select'
import { useSymbolContext } from '../Trade/context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import {
  getLastPrice,
  createPriceAlert,
  getPriceAlerts,
  deletePriceAlert,
  reactivatePriceAlert,
  updatePriceAlert,
} from '../api/api'
import {
  errorNotification,
  successNotification,
} from '../components/Notifications'
import precisionRound from '../helpers/precisionRound'
import { firebase } from '../firebase/firebase'
import capitalizeFirstLetter from '../helpers/capitalizeFirstLetter'

const db = firebase.firestore()

const parseSymbol = (symbol) => {
  if (!symbol) return ''
  return symbol.split('-')[1]
}

const INITIAL_STATE = {
  exchange: {}, // { label: 'Binance', value: 'binance' },
  symbol: {}, // { label: 'BTC-USDT', value: 'BINANCE:BTC/USDT' },
  condition: {}, // { label: `Less and equal to ≤`, value: '<=' },
  target_price: 0,
  status: '',
  note: '',
  fetchingSymbolPrice: true,
  saving: false,
}
const exchangeOptions = [
  { label: 'Binance', value: 'binance' },
  { label: 'FTX', value: 'ftx' },
  { label: 'Binance.us', value: 'binanceus' },
  { label: 'KuCoin', value: 'kucoin' },
]
const conditionOptions = [
  { label: `Less and equal to ≤`, value: '<=' },
  { label: 'Greater and equal to ≥', value: '>=' },
]
const customStyles = {
  control: (styles) => ({
    ...styles,
    boxShadow: 'none',
    border: '1px solid rgb(204, 204, 204)',
    borderRadius: '2px',
    height: '45px',
    minHeight: '45px',
    color: '#718096',

    '&:hover': {
      cursor: 'pointer',
    },
  }),

  valueContainer: (styles) => ({
    ...styles,
    height: '41px',
    padding: '0 5px',
  }),

  singleValue: (styles) => ({
    ...styles,
    textTransform: 'capitalize',
    color: '#718096',
  }),

  option: (styles) => ({
    ...styles,
    textTransform: 'capitalize',
    padding: '5px 5px',

    '&:hover': {
      cursor: 'pointer',
    },
  }),

  placeholder: (styles) => ({
    ...styles,
    textTransform: 'capitalize',
  }),

  indicatorsContainer: (styles) => ({
    ...styles,
    height: '41px',
  }),
}
const AddOrEditPriceAlert = ({
  type,
  alert_id,
  exchange,
  symbol,
  target_price,
  condition,
  status,
  cardOp,
  onCancel,
}) => {
  const { symbols, symbolDetails, binanceDD, ftxDD, binanceUSDD, kucoinDD } =
    useSymbolContext()

  const [state, setState] = useState(INITIAL_STATE)
  const roundOff = (price) => {
    if (parseFloat(price) >= 1) return precisionRound(price)
    else return parseFloat(price)
  }

  const evalSymbolPrice = useCallback(async (symbol, exchange) => {
    setState((prevVal) => ({ ...prevVal, fetchingSymbolPrice: true }))
    try {
      const resp = await getLastPrice(symbol, exchange)
      setState((prevVal) => ({
        ...prevVal,
        target_price:
          resp?.data?.last_price === 'NA'
            ? '0.00'
            : roundOff(resp?.data?.last_price),
      }))
    } catch (e) {
      console.log(e)
    } finally {
      setState((prevVal) => ({ ...prevVal, fetchingSymbolPrice: false }))
    }
  }, [])

  useEffect(() => {
    if (type === 'edit') {
      const fCond = conditionOptions.find((item) => item.value === condition)
      const editState = {
        exchange: { label: capitalizeFirstLetter(exchange), value: exchange },
        symbol: {
          label: symbol.replace('/', '-'),
          value: `${exchange.toUpperCase()}:${symbol}`,
        },
        condition: fCond,
        target_price,
        status,
      }
      setState({
        ...INITIAL_STATE,
        fetchingSymbolPrice: false,
        ...editState,
      })
    } else if (type === 'add') {
      setState({
        ...INITIAL_STATE,
        exchange: { label: 'Binance', value: 'binance' },
        symbol: { label: 'BTC-USDT', value: 'BINANCE:BTC/USDT' },
        condition: { label: `Less and equal to ≤`, value: '<=' },
      })
      // setSymbolDD(Object.values(symbols).filter(item => item.value.includes("BINANCE")))
    } else {
      console.error('Invalid Option')
    }
  }, [condition, exchange, status, symbol, target_price, type])

  useEffect(() => {
    if (!state.symbol?.label) return
    setState((prevVal) => ({ ...prevVal, fetchingSymbolPrice: true }))
    evalSymbolPrice(state.symbol.label.replace('-', '/'), state.exchange.value)
  }, [evalSymbolPrice, state.exchange.value, state.symbol])

  useEffect(() => {
    if (!state?.exchange) return
    if (state.exchange.value === 'binance') {
      let key = `BINANCE:${state.symbol.label.replace('-', '/')}`
      if (!symbolDetails[key])
        setState((prevVal) => ({
          ...prevVal,
          symbol: { label: 'BTC-USDT', value: 'BINANCE:BTC/USDT' },
        }))
    } else if (state.exchange.value === 'ftx') {
      let key = `FTX:${state.symbol.label.replace('-', '/')}`
      if (!symbolDetails[key])
        setState((prevVal) => ({
          ...prevVal,
          symbol: { label: 'BTC-USDT', value: 'FTX:BTC/USDT' },
        }))
    } else if (state.exchange.value === 'binanceus') {
      let key = `BINANCEUS:${state.symbol.label.replace('-', '/')}`
      if (!symbolDetails[key])
        setState((prevVal) => ({
          ...prevVal,
          symbol: { label: 'BTC-USDT', value: 'BINANCEUS:BTC/USDT' },
        }))
    } else if (state.exchange.value === 'kucoin') {
      let key = `KUCOIN:${state.symbol.label.replace('-', '/')}`
      if (!symbolDetails[key])
        setState((prevVal) => ({
          ...prevVal,
          symbol: { label: 'BTC-USDT', value: 'KUCOIN:BTC/USDT' },
        }))
    }
  }, [state.exchange, state.symbol.label, symbolDetails])

  const onInputChange = (name, val) => {
    setState((prevVal) => ({ ...prevVal, [name]: val }))
  }

  const onSave = async () => {
    try {
      setState((prev) => ({ ...prev, saving: true }))
      const currState = {
        exchange: state.exchange.value,
        symbol: state.symbol.label,
        condition: state.condition.value,
        target_price: state.target_price,
      }
      const reqPayload = {
        ...currState,
        symbol: state.symbol.label.replace('-', '/'),
      }
      const resp = await createPriceAlert(reqPayload)
      if (resp?.status === 'OK') {
        successNotification.open({ description: 'Price alert created!' })
        cardOp('add', {
          ...currState,
          alert_id: resp.alert_id,
          status: 'active',
        })
      } else {
        errorNotification.open({ description: resp?.error })
      }
    } catch (e) {
      console.log(e)
      errorNotification.open({ description: 'Price alert creation failed!' })
    } finally {
    }
  }

  const onUpdate = async () => {
    try {
      setState((prev) => ({ ...prev, saving: true }))
      const currState = {
        exchange: state.exchange.value,
        symbol: state.symbol.label,
        condition: state.condition.value,
        target_price: state.target_price,
      }
      const reqPayload = {
        ...currState,
        symbol: state.symbol.label.replace('-', '/'),
      }
      const resp = await updatePriceAlert(alert_id, reqPayload)
      if (resp?.status === 'OK') {
        successNotification.open({ description: 'Price alert updated!' })
        cardOp('edit', {
          ...currState,
          old_alert_id: alert_id,
          alert_id: resp.alert_id,
          status: 'active',
        })
      } else {
        errorNotification.open({ description: resp?.error })
      }
    } catch (e) {
      console.log(e)
      errorNotification.open({
        description: 'Price alert modification failed!',
      })
    } finally {
    }
  }

  return (
    <div className={`${type === 'edit' ? '' : 'card card-fluid'}`}>
      <div className={`${type === 'edit' ? '' : 'card-body'}`}>
        <div className="row">
          <div className="col-lg-3 col-md-6">
            <label>Select exchange</label>
            <DropDownSelect
              options={exchangeOptions}
              style={{ borderRadius: '4px', outline: '0', height: '44px' }}
              placeholder="Select exchange"
              values={[state.exchange]}
              searchable={false}
              valueField="label"
              onChange={(val) => onInputChange('exchange', val[0])}
            />
          </div>
          <div className="col-lg-3 col-md-6">
            {/* <label className={`${!binanceDD.length || !ftxDD.length ? 'd-block' : 'd-none'}`}>Loading symbols.. <span className="spinner-border spinner-border-sm mb-1" /></label>
            <label className={`${binanceDD.length && ftxDD.length ? 'd-block' : 'd-none'} `}>Select symbol</label> */}
            <label>Select symbol</label>
            <Select
              components={{
                IndicatorSeparator: () => null,
              }}
              options={binanceDD}
              placeholder="Select trading pair"
              value={state.symbol}
              onChange={(value) => onInputChange('symbol', value)}
              isDisabled={!binanceDD.length}
              styles={customStyles}
              className={`${
                state.exchange.value === 'binance' ? 'd-block' : 'd-none'
              }`}
            />
            <Select
              components={{
                IndicatorSeparator: () => null,
              }}
              options={ftxDD}
              placeholder="Select trading pair"
              value={state.symbol}
              onChange={(value) => onInputChange('symbol', value)}
              isDisabled={!ftxDD.length}
              styles={customStyles}
              className={`${
                state.exchange.value === 'ftx' ? 'd-block' : 'd-none'
              }`}
            />
            <Select
              components={{
                IndicatorSeparator: () => null,
              }}
              options={binanceUSDD}
              placeholder="Select trading pair"
              value={state.symbol}
              onChange={(value) => onInputChange('symbol', value)}
              isDisabled={!binanceUSDD.length}
              styles={customStyles}
              className={`${
                state.exchange.value === 'binanceUSDD' ? 'd-block' : 'd-none'
              }`}
            />
            <Select
              components={{
                IndicatorSeparator: () => null,
              }}
              options={kucoinDD}
              placeholder="Select trading pair"
              value={state.symbol}
              onChange={(value) => onInputChange('symbol', value)}
              isDisabled={!binanceUSDD.length}
              styles={customStyles}
              className={`${
                state.exchange.value === 'kucoinDD' ? 'd-block' : 'd-none'
              }`}
            />
            {/* <div className={`${state.exchange.value === 'binance' ? 'd-flex' : 'd-none'}`}>
              <DropDownSelect
                options={binanceDD}
                style={{ borderRadius: '4px', outline: '0', height: '44px' }}
                placeholder="Select symbol"
                values={[state.symbol]}
                valueField="label"
                disabled={!binanceDD.length}
                onChange={(val) => onInputChange('symbol', val[0])}
                searchable={false}
              />
            </div>
            <div className={`${state.exchange.value === 'ftx' ? 'd-flex' : 'd-none'}`}>
              <DropDownSelect
                options={ftxDD}
                style={{ borderRadius: '4px', outline: '0', height: '44px' }}
                placeholder="Select symbol"
                values={[state.symbol]}
                valueField="label"
                disabled={!ftxDD.length}
                onChange={(val) => onInputChange('symbol', val[0])}
                searchable={false}
              />
            </div> */}
          </div>
          <div className="col-lg-3 col-md-6">
            <label>Select alert condition</label>
            <DropDownSelect
              options={conditionOptions}
              style={{ borderRadius: '4px', outline: '0', height: '44px' }}
              placeholder="Select exchange"
              values={[state.condition]}
              searchable={false}
              valueField="label"
              onChange={(val) => onInputChange('condition', val[0])}
            />
          </div>
          <div className="col-lg-3 col-md-6">
            <label>
              Enter target price ({parseSymbol(state.symbol?.label)})
            </label>
            {/* step={stepSize(state.target_price)} */}
            <input
              type="number"
              className="form-control"
              disabled={state.fetchingSymbolPrice}
              style={{ borderRadius: '4px', outline: '0', height: '44px' }}
              value={state.target_price}
              onChange={(e) => onInputChange('target_price', e.target.value)}
            />
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-md-12 text-right">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => (type === 'edit' ? onUpdate() : onSave())}
              disabled={
                state.saving || state.fetchingSymbolPrice || !symbols.length
              }
            >
              {state.saving ? (
                <span className="spinner-border spinner-border-sm" />
              ) : type === 'edit' ? (
                'Update'
              ) : (
                'Save'
              )}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onCancel}
              disabled={state.saving}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const SinglePriceAlert = ({
  alert_id,
  exchange,
  symbol,
  target_price,
  condition,
  status,
  type,
  delClick,
  delId,
  isLast,
  alertUpdated,
  onReactivate,
}) => {
  const [editAlert, setEditAlert] = useState(false)
  const state = { alert_id, exchange, symbol, target_price, condition, status }

  return (
    <div
      className="py-3"
      style={!isLast ? { borderBottom: '1px solid #e2e8f0' } : {}}
    >
      {editAlert && (
        <AddOrEditPriceAlert
          type="edit"
          cardOp={(type, data) => {
            alertUpdated(type, data)
            setEditAlert(false)
          }}
          onCancel={() => setEditAlert(false)}
          {...state}
        />
      )}
      <div
        className={`row align-items-center ${editAlert ? 'd-none' : 'd-flex'}`}
      >
        <div className="col-auto">
          <div
            className={`icon icon-shape ${
              state.condition === '<='
                ? 'bg-soft-danger text-danger'
                : 'bg-soft-success text-success'
            }`}
            style={{ width: '2.5rem', height: '2.5rem' }}
          >
            <i
              className={`fas ${
                state.condition === '<='
                  ? 'fa-less-than-equal'
                  : 'fa-greater-than-equal'
              }`}
            ></i>
          </div>
        </div>
        <div className="col pl-0">
          <span className="d-block h6 text-sm mb-0">
            {state.symbol.replace('-', '/')} [
            {capitalizeFirstLetter(state.exchange)}]
          </span>
          <p className="mb-0 text-sm">
            price {state.condition === '>=' ? '≥' : '≤'} {state.target_price}{' '}
            {parseSymbol(state.symbol)}
          </p>
        </div>
        <div className="col-auto actions">
          {type === 'completed' ? (
            <div className="actions ml-3">
              {delId && delId === state.alert_id ? (
                <span className="spinner-border spinner-border-sm mr-2" />
              ) : (
                <a className="action-item mr-2" onClick={onReactivate}>
                  Reactivate
                </a>
              )}
            </div>
          ) : (
            <div className="actions ml-3">
              <a
                className="action-item mr-2"
                data-for="edit"
                data-tip="Edit"
                onClick={() => setEditAlert(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-edit-2"
                >
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
                <Tooltip id="edit" />
              </a>
              {delId && delId === state.alert_id ? (
                <span className="spinner-border spinner-border-sm mr-2" />
              ) : (
                <a
                  className="action-item text-danger mr-2"
                  data-for="delete"
                  data-tip="Delete"
                  onClick={() => delClick(state.alert_id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-trash-2"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  <Tooltip id="delete" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const PriceAlerts = () => {
  const [fetching, setFetching] = useState(true)
  const [priceAlertData, setPriceAlertData] = useState([])
  const [showCreateAlert, setShowCreateAlert] = useState(false)
  const [completedAlerts, setCompletedAlerts] = useState([])
  const [delId, setDelId] = useState(null)
  const [snapShotCount, setSnapShotCount] = useState(0)
  const [fBData, setFBData] = useState(null)
  const { userData } = useContext(UserContext)
  const { symbolDetails } = useSymbolContext()

  useEffect(() => {
    getAllPriceAlerts()
    const fBNotice = db
      .collection('price_alerts')
      .where('user', '==', userData.email)
      .onSnapshot((doc) => {
        doc.docChanges().forEach((item) => {
          // item.type = added , removed, modified
          if (item.type === 'modified') {
            setFBData(item.doc.data())
          }
        })
        setSnapShotCount((prevValue) => prevValue + 1)
      })
    return () => {
      fBNotice()
    }
  }, [userData.email])

  useEffect(() => {
    if (
      snapShotCount === 0 ||
      !symbolDetails ||
      !Object.keys(symbolDetails).length
    )
      return
    if (
      !fBData ||
      !fBData['status'] ||
      !fBData['price_alert_details'] ||
      !fBData['alert_id']
    )
      return
    const { status, price_alert_details, alert_id } = fBData
    if (status === 'active') {
      // if not exists put in active alerts section, and take out of past alerts section if it's there
      setPriceAlertData((prevState) => {
        let check = prevState.find((item) => item.alert_id === alert_id)
        if (check) {
          return prevState
        } else {
          return [{ alert_id, status, ...price_alert_details }, ...prevState]
        }
      })
      setCompletedAlerts((prevState) => {
        let check = prevState.findIndex((item) => item.alert_id === alert_id)
        if (check > -1) {
          let tempArr = [...prevState]
          tempArr.splice(check, 1)
          return tempArr
        } else {
          return prevState
        }
      })
    } else if (status === 'completed') {
      setCompletedAlerts((prevState) => {
        let check = prevState.find((item) => item.alert_id === alert_id)
        if (check) {
          return prevState
        } else {
          return [{ alert_id, status, ...price_alert_details }, ...prevState]
        }
      })
      setPriceAlertData((prevState) => {
        let check = prevState.findIndex((item) => item.alert_id === alert_id)
        if (check > -1) {
          let tempArr = [...prevState]
          tempArr.splice(check, 1)
          return tempArr
        } else {
          return prevState
        }
      })
    }
  }, [fBData, snapShotCount, symbolDetails])

  const getAllPriceAlerts = async () => {
    try {
      setFetching(true)
      const resp = await getPriceAlerts()
      const { alerts } = resp
      let active = [],
        completed = []
      for (let i = 0; i < alerts.length; i++) {
        let item = alerts[i]
        if (item.status === 'active') {
          active.push(item)
        } else if (item.status === 'completed') {
          completed.push(item)
        }
      }
      setPriceAlertData(active)
      setCompletedAlerts(completed)
    } catch (e) {
      console.log(e)
    } finally {
      setFetching(false)
    }
  }

  const onAlertDelete = async (id) => {
    try {
      setDelId(id)
      const resp = await deletePriceAlert(id)
      if (resp?.status === 'OK') {
        // setPriceAlertData(prevState => prevState.filter(item => item.alert_id !== id))
        setPriceAlertData((prevState) => {
          let tempAlerts = [...prevState]
          let fIndex = tempAlerts.findIndex((item) => item.alert_id === id)
          tempAlerts.splice(fIndex, 1)
          return tempAlerts
        })
        successNotification.open({
          description: 'Price alert deleted',
          key: 'deleted',
        })
      } else {
        errorNotification.open({ description: resp?.error })
      }
    } catch (e) {
      errorNotification.open({ description: `Alert couldn't be deleted!` })
    } finally {
      setDelId(null)
    }
  }

  const onAdded = (type, data) => {
    if (type === 'add') {
      setPriceAlertData((prevState) => [data, ...prevState])
      setShowCreateAlert(false)
    }
  }

  const onAlertUpdate = (type, data) => {
    if (type === 'edit') {
      setPriceAlertData((prevState) => {
        let tempAlerts = [...prevState]
        let fIndex = tempAlerts.findIndex(
          (item) => item.alert_id === data.old_alert_id
        )
        tempAlerts[fIndex] = { ...data }
        return tempAlerts
      })
    }
  }

  const onAlertReactivate = async (data) => {
    const { alert_id } = data
    setDelId(alert_id)
    try {
      const resp = await reactivatePriceAlert(alert_id)
      if (resp?.status === 'OK') {
        setCompletedAlerts((prevState) => {
          let tempAlerts = [...prevState]
          let fIndex = tempAlerts.findIndex(
            (item) => item.alert_id === alert_id
          )
          tempAlerts.splice(fIndex, 1)
          return tempAlerts
        })
        setPriceAlertData((prevState) => [
          { ...data, alert_id: resp.alert_id },
          ...prevState,
        ])
        successNotification.open({
          description: 'Price alert deleted',
          key: 'deleted',
        })
      } else {
        errorNotification.open({ description: resp?.error })
      }
    } catch (e) {
      console.log(e)
      errorNotification.open({ description: `Alert didn't re-activate!` })
    } finally {
      setDelId(null)
    }
  }

  return (
    <section
      className="pt-5 bg-section-secondary price-alerts"
      style={{ minHeight: 'calc(100vh - 72px)' }}
    >
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="row align-items-center mb-4">
              <div className="col">
                <h1 className="h4 mb-0">Price Alerts</h1>
              </div>
              <div className="col-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-primary btn-icon"
                  onClick={() => setShowCreateAlert(true)}
                >
                  <span className="btn-inner--text">
                    Create New Alert <i className="fas fa-plus ml-2"></i>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {showCreateAlert && (
          <AddOrEditPriceAlert
            type="add"
            cardOp={onAdded}
            onCancel={() => {
              setShowCreateAlert(false)
            }}
          />
        )}

        <div className={`card card-fluid`}>
          <div className="card-header pb-3">
            <div className="mb-3">
              <span className="h6">Active Alerts</span>
            </div>

            {priceAlertData.map((item, index) => (
              <SinglePriceAlert
                key={`price-alert-active-${index + 1}`}
                delId={delId}
                isLast={index === priceAlertData.length - 1}
                delClick={(del_id) => onAlertDelete(del_id)}
                alertUpdated={onAlertUpdate}
                {...item}
              />
            ))}

            <div className="d-flex justify-content-center mt-3">
              <p
                className={`${
                  !fetching && !priceAlertData.length ? 'd-block' : 'd-none'
                }`}
              >
                {' '}
                Nothing to show!
              </p>
              <span
                className={`spinner-border text-primary ${
                  fetching ? 'd-inline-block' : 'd-none'
                }`}
                role="status"
              ></span>
            </div>
          </div>
        </div>

        <div
          className={`card card-fluid ${
            !fetching && completedAlerts.length
          } ? 'd-block' : 'd-none'`}
        >
          <div className="card-header pb-3">
            <div className="mb-3">
              <span className="h6">Past Alerts</span>
            </div>

            {completedAlerts.map((item, index) => (
              <SinglePriceAlert
                key={`price-alert-completed-${index + 1}`}
                type={item.status}
                isLast={index === completedAlerts.length - 1}
                onReactivate={() => onAlertReactivate(item)}
                delId={delId}
                {...item}
              />
            ))}
            <div className="d-flex justify-content-center mt-3">
              <p
                className={`${
                  !fetching && !completedAlerts.length ? 'd-block' : 'd-none'
                }`}
              >
                {' '}
                Nothing to show!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PriceAlerts
