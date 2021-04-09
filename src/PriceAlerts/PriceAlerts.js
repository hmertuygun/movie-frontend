import React, { useContext, useState, useEffect } from 'react'
import Tooltip from '../components/Tooltip'
import DropDownSelect from 'react-dropdown-select'
import { useSymbolContext } from '../Trade/context/SymbolContext'
import { getLastPrice, createPriceAlert, getPriceAlerts, deletePriceAlert, reactivatePriceAlert, updatePriceAlert } from '../api/api'
import { errorNotification, successNotification } from '../components/Notifications'
import precisionRound from '../helpers/precisionRound'

const parseSymbol = (symbol) => {
  if (!symbol) return ''
  return symbol.split("-")[1]
}

const ADD_EDIT_INITIAL_STATE = {
  exchange: { label: 'Binance', value: 'Binance' },
  symbol: { label: 'BTC-USDT', value: 'BINANCE:BTCUSDT' },
  condition: { label: `Less and equal to ≤`, value: '<=' },
  target_price: 0,
  status: '',
  note: '',
  fetchingSymbolPrice: true,
  saving: false,
}

const AddOrEditPriceAlert = ({ type, alert_id, exchange, symbol, target_price, condition, status, note, showAlertCard, cardOp }) => {
  const { symbols } = useSymbolContext()
  const [state, setState] = useState(ADD_EDIT_INITIAL_STATE)

  const handleSearch = ({ state }) => {
    const filteredData = Object.values(symbols).filter((search) =>
      search.label
        .split('-')[0]
        .toLowerCase()
        .includes(state.search.toLowerCase())
    )
    if (!filteredData.length) {
      return Object.values(symbols).filter((search) =>
        search.label.toLowerCase().includes(state.search.toLowerCase())
      )
    }
    return filteredData
  }

  const exchangeOptions = [{ label: 'Binance', value: 'Binance' }]
  const conditionOptions = [{ label: `Less and equal to ≤`, value: '<=' }, { label: 'Greater and equal to ≥', value: '>=' }]

  useEffect(() => {
    if (type === "edit") {
      const fCond = conditionOptions.find((item) => item.value === condition)
      const editState = {
        exchange: { label: exchange, value: exchange },
        symbol: { label: symbol, value: `${exchange.toUpperCase()}:${symbol.replace("-", "")}` },
        condition: fCond,
        target_price,
        status
      }
      setState({
        ...ADD_EDIT_INITIAL_STATE,
        fetchingSymbolPrice: false,
        ...editState
      })
    }
    else if (type === "add") {
    }
    else {
      console.error("Invalid Option")
    }
  }, [])

  const onInputChange = (name, val) => {
    setState(prevVal => ({ ...prevVal, [name]: val }))
  }

  useEffect(() => {
    if (!state.symbol?.label || type === "edit") return
    setState(prevVal => ({ ...prevVal, fetchingSymbolPrice: true }))
    getLastPrice(state.symbol.label.replace('-', ''))
      .then((res) => {
        setState(prevVal => ({ ...prevVal, target_price: precisionRound(res?.data?.last_price) }))
      })
      .catch((e) => {
        console.log(e)
      })
      .finally(() => {
        setState(prevVal => ({ ...prevVal, fetchingSymbolPrice: false }))
      })
  }, [state.symbol])

  const onSave = async () => {
    try {
      setState(prev => ({ ...prev, saving: true }))
      const currState = { exchange: state.exchange.value, symbol: state.symbol.label, condition: state.condition.value, target_price: state.target_price }
      const reqPayload = { ...currState, symbol: state.symbol.label.replace('-', '') }
      const resp = await createPriceAlert(reqPayload)
      if (resp?.status === "OK") {
        successNotification.open({ description: 'Price alert created!' })
        cardOp("add", { ...currState, alert_id: resp.alert_id, status: "active" })
      }
      else {
        errorNotification.open({ description: resp?.error })
      }
    }
    catch (e) {
      console.log(e)
      errorNotification.open({ description: 'Price alert creation failed!' })
    }
    finally {
    }
  }

  const onUpdate = async () => {
    try {
      setState(prev => ({ ...prev, saving: true }))
      const currState = { exchange: state.exchange.value, symbol: state.symbol.label, condition: state.condition.value, target_price: state.target_price }
      const reqPayload = { ...currState, symbol: state.symbol.label.replace('-', '') }
      const resp = await updatePriceAlert(alert_id, reqPayload)
      if (resp?.status === "OK") {
        successNotification.open({ description: 'Price alert updated!' })
        cardOp("edit", { ...currState, alert_id: resp.alert_id, status: "active" })
      }
      else {
        errorNotification.open({ description: resp?.error })
      }
    }
    catch (e) {
      console.log(e)
      errorNotification.open({ description: 'Price alert modification failed!' })
    }
    finally {

    }
  }

  return (
    <div className={`${type === "edit" ? '' : 'card card-fluid'}`}>
      <div className={`${type === "edit" ? '' : 'card-body'}`}>
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
            <label>Select symbol</label>
            <DropDownSelect
              options={Object.values(symbols)}
              style={{ borderRadius: '4px', outline: '0', height: '44px' }}
              placeholder="Select symbol"
              values={[state.symbol]}
              valueField="label"
              disabled={!symbols || !symbols.length}
              onChange={(val) => onInputChange('symbol', val[0])}
              searchFn={handleSearch}
            />
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
            <label>Enter target price ({parseSymbol(state.symbol?.label)})</label>
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
            <button className="btn btn-primary btn-sm" onClick={() => type === "edit" ? onUpdate() : onSave()} disabled={state.saving || state.fetchingSymbolPrice || !symbols.length}>
              {state.saving ? <span className="spinner-border spinner-border-sm" /> : type === "edit" ? 'Update' : 'Save'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => showAlertCard(false)} disabled={state.saving}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const SinglePriceAlert = ({ alert_id, exchange, symbol, target_price, condition, status, note, delClick, delId, isLast, alertUpdated }) => {
  const [editAlert, setEditAlert] = useState(false)
  //const [state, setState] = useState(null)

  // useEffect(() => {
  //   setState({ alert_id, exchange, symbol, target_price, condition, status })
  // }, [])

  // useEffect(() => {
  //   setEditAlert(false)
  //   setState({ alert_id, exchange, symbol, target_price, condition, status })
  // }, [state])

  // if (!state) return null

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
          {...state}
        />
        // updatedData={alertUpdated} , updatedData={(data) => setState(data)}
      )}
      <div
        className={`row align-items-center ${editAlert ? 'd-none' : 'd-flex'}`}
      >
        <div className="col-auto">
          <div
            className={`icon icon-shape ${state.condition === '<='
              ? 'bg-soft-danger text-danger'
              : 'bg-soft-success text-success'
              }`}
            style={{ width: '2.5rem', height: '2.5rem' }}
          >
            <i
              className={`fas ${state.condition === '<='
                ? 'fa-less-than-equal'
                : 'fa-greater-than-equal'
                }`}
            ></i>
          </div>
        </div>
        <div className="col pl-0">
          <span className="d-block h6 text-sm mb-0">
            {state.symbol} [{state.exchange}]
          </span>
          <p className="mb-0 text-sm">
            price {state.condition === '>=' ? '≥' : '≤'} {state.target_price}{' '}
            {parseSymbol(state.symbol)}
          </p>
        </div>
        <div className="col-auto actions">
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
        </div>
      </div>
    </div>
  )
}

const PriceAlerts = () => {
  const [fetching, setFetching] = useState(true)
  const [priceAlertData, setPriceAlertData] = useState([])
  const [showCreateAlert, setShowCreateAlert] = useState(false)
  const [delId, setDelId] = useState(null)

  useEffect(() => {
    getAllPriceAlerts()
  }, [])

  // useEffect(() => {
  //   console.log(priceAlertData)
  // }, [priceAlertData])

  const getAllPriceAlerts = async () => {
    try {
      setFetching(true)
      const res = await getPriceAlerts()
      setPriceAlertData(res?.alerts)
    }
    catch (e) {
      console.log(e)
    }
    finally {
      setFetching(false)
    }
  }

  const onAlertDelete = async (id) => {
    try {
      setDelId(id)
      const resp = await deletePriceAlert(id)
      if (resp?.status === "OK") {
        // setPriceAlertData(prevState => prevState.filter(item => item.alert_id !== id))
        setPriceAlertData(prevState => {
          let tempAlerts = [...prevState]
          let fIndex = tempAlerts.findIndex(item => item.alert_id === id)
          tempAlerts.splice(fIndex, 1)
          return tempAlerts
        })
        successNotification.open({ description: 'Price alert deleted', key: 'deleted' })
      }
      else {
        errorNotification.open({ description: resp?.error })
      }
    }
    catch (e) {
      errorNotification.open({ description: `Alert couldn't be deleted!` })
    }
    finally {
      setDelId(null)
    }
  }

  const onAdded = (type, data) => {
    if (type === "add") {
      console.log(type)
      console.log(data)
      setPriceAlertData(prevState => [data, ...prevState])
      setShowCreateAlert(false)
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
          />
        )}

        <div className={`card card-fluid`}>
          <div className="card-header pb-3">
            <div className="mb-3">
              <span className="h6">Active Alerts</span>
            </div>

            {priceAlertData.map((item, index) => (
              <SinglePriceAlert
                key={`price-alert-${index + 1}`}
                delId={delId}
                isLast={index === priceAlertData.length - 1}
                delClick={(del_id) => onAlertDelete(del_id)}
                {...item}
              />
            ))}

            <div className="d-flex justify-content-center mt-3">
              <p
                className={`${!fetching && !priceAlertData.length ? 'd-block' : 'd-none'
                  }`}
              >
                {' '}
                Nothing to show!
              </p>
              <span
                className={`spinner-border text-primary ${fetching ? 'd-inline-block' : 'd-none'
                  }`}
                role="status"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PriceAlerts
