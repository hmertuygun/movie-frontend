import React, { Component } from 'react'
import binanceDataFeed from './binanceDataFeed'
import ftxDataFeed from './ftxDataFeed'
import dataFeed from './dataFeed'
import precisionRound from '../../../helpers/precisionRound'
import { getChartDrawing, saveChartDrawing, deleteChartDrawing } from '../../../api/api'

const getLocalLanguage = () => {
  return navigator.language.split('-')[0] || 'en'
}
export default class TradingViewChart extends Component {

  constructor({ symbol, theme, email, intervals, openOrders, delOrderId, exchange, marketSymbols, chartReady }) {
    super()
    //const exchangeDataFeeds = { "binance": new binanceDataFeed({ selectedSymbolDetail, marketSymbols }), "ftx": new ftxDataFeed({ selectedSymbolDetail, marketSymbols }) }
    this.dF = new dataFeed({ debug: false, exchange, marketSymbols }) // exchangeDataFeeds[exchange]
    this.widgetOptions = {
      container_id: "chart_container",
      datafeed: this.dF,
      library_path: "/scripts/charting_library/",
      debug: false,
      fullscreen: false,
      language: getLocalLanguage(),
      autosize: true,
      favorites: {
        intervals: intervals,
      },
      disabled_features: ["header_symbol_search", "timeframes_toolbar", "header_undo_redo"],
      symbol,
    }
    this.tradingViewWidget = null
    this.chartObject = null
    this.orderLinesDrawn = []
    this.orderLineCount = 0
    this.state = {
      isChartReady: false,
      saveCount: 0,
      symbol,
      theme,
      email
    }
  }

  static getDerivedStateFromProps(newProps, prevState) {
    if (prevState.symbol !== newProps.symbol || prevState.theme !== newProps.theme) return { ...prevState, ...newProps }
    else return { ...prevState }
  }

  chartReady = () => {
    if (!this.tradingViewWidget) return
    try {
      this.tradingViewWidget.onChartReady(() => {
        this.chartObject = this.tradingViewWidget.activeChart()
        this.getChartDrawingFromServer()
        this.chartEvent("drawing_event")
      })
    }
    catch (e) {
      console.log(e)
    }
  }

  onIntervalSelect = () => {
    if (!this.chartObject) return
    try {
      this.chartObject.onIntervalChanged().subscribe(null, (interval, timeframeObj) => {
        if (this.props.exchange === "binance") {
          localStorage.setItem('selectedIntervalBinance', interval)
        }
        else if (this.props.exchange === "ftx") {
          localStorage.setItem('selectedIntervalFtx', interval)
        }
      })
    }
    catch (e) {
      console.log(e)
    }
  }

  setLastSelectedInterval = () => {
    if (!this.chartObject) return
    if (this.props.exchange === "binance") {
      this.chartObject.setResolution(localStorage.getItem('selectedIntervalBinance') || '1D')
    }
    else if (this.props.exchange === "ftx") {
      this.chartObject.setResolution(localStorage.getItem('selectedIntervalFtx') || '1D')
    }
  }

  chartEvent = (event) => {
    if (!this.tradingViewWidget) return
    try {
      this.tradingViewWidget.subscribe(event, (obj) => {
        this.saveChartDrawingToServer(event)
      })
    }
    catch (e) {
      console.log(`Error while subscribing to chart events!`)
    }
  }

  saveChartDrawingToServer = (event) => {
    this.tradingViewWidget.save((obj) => {
      console.log(`Saving Chart`)
      const str = JSON.stringify(obj.charts[0].panes)
      saveChartDrawing(this.state.email, str)
    })
  }

  changeSymbol = (newSymbol) => {
    if (!newSymbol || !this.tradingViewWidget || !this.chartObject) return
    try {
      this.chartObject.setSymbol(newSymbol)
      this.drawOpenOrdersChartLines(this.props.openOrders)
    }
    catch (e) {
      //console.log(e)
    }
  }

  drawOpenOrdersChartLines = async (openOrders) => {
    if (!this.chartObject || !this.state.isChartReady || !openOrders) return
    const PlacedOrderTooltip = 'Order is on the exchange order book.'
    const PendingOrderTooltip = 'Order is waiting to be placed in the order book.'
    try {
      const blue = "#008aff"
      const green = "#3cb690"
      const red = '#f25767'
      if (!this.orderLineCount) await new Promise(resolve => setTimeout(resolve, 2000))
      this.orderLineCount++
      for (let i = 0; i < this.orderLinesDrawn.length; i++) {
        const { trade_id, line_id } = this.orderLinesDrawn[i]
        let fData = openOrders.find(item => item.trade_id === trade_id)
        if (!fData) this.chartObject.setEntityVisibility(line_id, false)
      }
      // openOrders = openOrders.filter(item => this.orderLinesDrawn.findIndex(item1 => item1.trade_id === item.trade_id) === -1)
      for (let i = 0; i < openOrders.length; i++) {
        const { trade_id, orders, type, symbol } = openOrders[i]
        if (this.props.symbol.replace('/', '-') !== symbol) continue // skip orders with symbol not equal to the one selected/shown in chart 
        const isFullTrade = type.includes("Full")
        for (let j = 0; j < orders.length; j++) {
          const { type, total, side, quote_asset, status, price, trigger, symbol } = orders[j]
          const orderColor = side === "Sell" ? red : side === "Buy" ? green : '#000'
          const orderText = type.includes("STOP") ? `${type.replace('-', ' ')} Trigger ${trigger}` : `${type}`
          const showOnlyEntryOrder = symbol.toLowerCase() === "entry" && status.toLowerCase() === "pending"
          if ((symbol.toLowerCase() === "entry" && status.toLowerCase() !== "pending")) continue
          let toolTipText
          let orderPrice
          let orderLineId
          if (isFullTrade) {
            if (symbol.toLowerCase() === "entry") {
              if (status.toLowerCase() !== "pending") {
                toolTipText = PlacedOrderTooltip
              }
              else {
                let toolTip = ''
                for (let k = 1; k < orders.length; k++) {
                  // Stop-loss, Target 1, Stop-market in symbol
                  let symbolKey = orders[k].symbol
                  symbolKey = symbolKey.replace('-', ' ')
                  let splKey = symbolKey.split(" ")
                  toolTip = toolTip + splKey[0].charAt(0).toUpperCase() + splKey[1].charAt(0).toUpperCase() + ' ' + orders[k].trigger + ', '
                }
                toolTipText = toolTip
              }
            }
            else {
              toolTipText = status.toLowerCase() === "pending" ? PendingOrderTooltip : PlacedOrderTooltip
            }
            if (trigger && trigger.length) { // price === "Market"
              if (showOnlyEntryOrder) {
                orderPrice = trigger
              }
              else {
                if (trigger.includes(">=")) {
                  let split = trigger.split(">= ")
                  orderPrice = split[1]
                }
                else if (trigger.includes("<=")) {
                  let split = trigger.split("<= ")
                  orderPrice = split[1]
                }
              }
            }
            else {
              orderPrice = price
            }
            orderLineId = trade_id + '-' + symbol.toLowerCase().replace(' ', '-')
          }
          else {
            orderPrice = price === "Market" ? trigger : price
            toolTipText = status.toLowerCase() === "pending" ? PendingOrderTooltip : PlacedOrderTooltip
            orderLineId = trade_id
          }

          const fIndex = this.orderLinesDrawn.findIndex(item => item.id === orderLineId)
          if (fIndex > -1) { // if order is already drawn
            const { line_id, trade_id, entity } = this.orderLinesDrawn[fIndex]
            if (status.toLowerCase() === "filled") { // if order is already drawn and the status is 'filled' hide it.
              this.chartObject.setEntityVisibility(line_id, false)
            }
            else {
              entity.setTooltip(toolTipText)
                .setText(orderText)
                .setQuantity(`${total} ${quote_asset}`)
                .setPrice(orderPrice)
            }
          }
          else { // if order is not already drawn
            if (status.toLowerCase() === "filled") continue // if order status is filled , don't draw it
            let entity = this.chartObject.createOrderLine()
              .setTooltip(toolTipText)
              .setLineLength(60)
              .setExtendLeft(false)
              .setLineColor(orderColor)
              .setBodyBorderColor(orderColor)
              .setBodyTextColor(orderColor)
              .setQuantityBackgroundColor(orderColor)
              .setQuantityBorderColor(orderColor)
              // .setQuantityTextColor("rgb(255,255,255)")
              .setText(orderText)
              .setQuantity(`${total} ${quote_asset}`)
              .setPrice(orderPrice)
            this.orderLinesDrawn.push({ line_id: entity?._line?._id, id: orderLineId, trade_id, entity })
          }
          if (showOnlyEntryOrder) break
        }
      }
    }
    catch (e) {
      console.log(e)
    }
  }

  deleteOpenOrderLine = (trade_id) => {
    if (!this.chartObject || !this.state.isChartReady || !trade_id) return
    let fData = this.orderLinesDrawn.find(item => item.trade_id === trade_id)
    if (fData && fData.line_id) this.chartObject.setEntityVisibility(fData.line_id, false)
  }

  removeAllDrawings = () => {
    if (!this.chartObject) return
    this.chartObject.removeAllShapes()
    localStorage.removeItem('savedDrawing')
  }

  addButtonToHeader = async () => {
    if (!this.tradingViewWidget) return
    await this.tradingViewWidget.headerReady()
    var button = this.tradingViewWidget.createButton()
    button.setAttribute('title', 'Clear all Drawings')
    button.setAttribute('class', 'btn btn-primary')
    button.addEventListener('click', this.removeAllDrawings);
    button.textContent = 'Clear Drawings'
  }

  getChartDrawingFromServer = async () => {
    try {
      if (!this.tradingViewWidget) return
      const cData = await getChartDrawing(this.state.email)
      if (cData?.error) {
        this.setLastSelectedInterval()
        this.onIntervalSelect()
        this.setState({
          isChartReady: true
        })
        this.chartEvent("study_event")
        setTimeout(() => {
          this.props.chartReady(true)
        }, 2500)
        return
      }
      else {
        const pData = JSON.parse(cData)
        this.tradingViewWidget.save((obj) => {
          const prep = { ...obj.charts[0], panes: pData }
          this.tradingViewWidget.load(prep)
        })
      }
    }
    catch (e) {
      console.log(e)
    }
    finally {
      this.setLastSelectedInterval()
      this.onIntervalSelect()
      this.setState({
        isChartReady: true
      })
      this.chartEvent("study_event")
      setTimeout(() => {
        this.props.chartReady(true)
      }, 2500)
    }
  }

  componentDidMount() {
    this.tradingViewWidget = (window.tvWidget = new window.TradingView.widget(this.widgetOptions))
    this.chartReady()
  }

  componentDidUpdate() {
    if (!this.tradingViewWidget) return
    this.changeSymbol(this.props.symbol)
  }

  componentWillUnmount() {
    console.info(`Chart component unmounted`)
  }

  componentDidCatch() {
    console.info(`Error while rendering chart`)
    console.log(this.tradingViewWidget)
    console.log(this.chartObject)
    console.log(this.state.isChartReady)
  }

  render() {
    const { isChartReady } = this.state
    return (
      <div id="chart_outer_container" className="d-flex justify-content-center align-items-center" style={{ width: "100%", height: "100%" }}>
        <span className="spinner-border spinner-border-sm text-primary" style={{ display: isChartReady ? 'none' : 'block' }} />
        <div id='chart_container' style={{ width: "100%", height: "100%", borderTop: '1px solid #bbb', display: isChartReady ? 'block' : 'none' }}></div>
      </div>
    )
  }
}