import React, { Component } from 'react'
import dataFeed from './dataFeed'
import { getChartDrawing, saveChartDrawing, deleteChartDrawing } from '../../../api/api'

const getLocalLanguage = () => {
  return navigator.language.split('-')[0] || 'en'
}
export default class TradingViewChart extends Component {

  constructor({ symbol, theme, email, intervals, openOrders, delOrderId, exchange, marketSymbols, selectedSymbolDetail }) {
    super()
    this.dF = new dataFeed({ debug: false, exchange, selectedSymbolDetail, marketSymbols })
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
    this.tradingViewWidget.onChartReady(() => {
      this.chartObject = this.tradingViewWidget.activeChart()
      this.getChartDrawingFromServer()
      this.chartEvent("drawing_event")
    })
  }

  chartEvent = (event) => {
    this.tradingViewWidget.subscribe(event, (obj) => {
      this.saveChartDrawingToServer(event)
    })
  }

  saveChartDrawingToServer = (event) => {
    this.tradingViewWidget.save((obj) => {
      console.log(`Saving Chart`)
      const str = JSON.stringify(obj.charts[0].panes)
      saveChartDrawing(this.state.email, str)
    })
  }

  changeSymbol = (newSymbol) => {
    if (!newSymbol || !this.tradingViewWidget) return
    try {
      const symbObj = this.tradingViewWidget.symbolInterval()
      if (!symbObj) return
      this.tradingViewWidget.setSymbol(newSymbol, symbObj.interval, () => { })
    }
    catch (e) {
      //console.log(e)
    }
  }

  drawOpenOrdersChartLines = async (openOrders) => {
    if (!this.chartObject || !this.state.isChartReady || !openOrders || !openOrders.length) return
    try {
      const blue = "#008aff"
      const green = "#3cb690"
      const red = '#f25767'
      if (!this.orderLineCount) await new Promise(resolve => setTimeout(resolve, 2000))
      this.orderLineCount++
      openOrders = openOrders.filter(item => this.orderLinesDrawn.findIndex(item1 => item1.trade_id === item.trade_id) === -1)
      for (let i = 0; i < openOrders.length; i++) {
        const { type, total, side, quote_asset, status, price, trade_id, trigger } = openOrders[i]
        const orderColor = side === "Sell" ? red : side === "Buy" ? green : '#000'
        const orderText = type.includes("STOP") ? `${type.replace('-', ' ')} Trigger ${side === 'Buy' ? '<=' : '>='}${trigger}` : `${type} order`
        const orderPrice = price === "Market" ? trigger : price
        let entity = this.chartObject.createOrderLine()
          .setTooltip(`${type} order ${status}`)
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
        this.orderLinesDrawn.push({ line_id: entity._line._id, trade_id, lineObj: entity })
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
      const cData = await getChartDrawing(this.state.email)
      if (!cData) {
        this.chartEvent("study_event")
        return
      }
      const pData = JSON.parse(cData)
      this.tradingViewWidget.save((obj) => {
        const prep = { ...obj.charts[0], panes: pData }
        this.tradingViewWidget.load(prep)
      })
    }
    catch (e) {
      console.log(e)
    }
    finally {
      this.setState({
        isChartReady: true
      })
      this.chartEvent("study_event")
    }
  }

  componentDidMount() {
    this.tradingViewWidget = (window.tvWidget = new window.TradingView.widget(this.widgetOptions))
    this.chartReady()
  }

  componentDidUpdate() {
    if (!this.tradingViewWidget) return
    //console.log(`In Update`)
    this.changeSymbol(this.state.symbol)
    // this.drawOpenOrdersChartLines(this.props.openOrders)
    // this.deleteOpenOrderLine(this.props.delOrderId)
  }

  componentWillUnmount() {
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