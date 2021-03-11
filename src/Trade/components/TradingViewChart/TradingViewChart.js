import React, { useState, useEffect, useContext, Component } from 'react'
import binanceAPI from '../../../api/binanceAPI'
import { getChartDrawing, saveChartDrawing } from '../../../api/api'
import { UserContext } from '../../../contexts/UserContext'
const getLocalLanguage = () => {
  return navigator.language.split('-')[0] || 'en'
}
export default class TradingViewChart extends Component {
  constructor({ symbol, theme, email }) {
    super()
    this.bfAPI = new binanceAPI({ debug: false })
    this.widgetOptions = {
      container_id: "chart_container",
      datafeed: this.bfAPI,
      library_path: "/scripts/charting_library/",
      debug: false,
      fullscreen: false,
      language: getLocalLanguage(),
      autosize: true,
      interval: '1D', // '1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'
      symbol: symbol || 'BINANCE:BTCUSDT',
      disabled_features: ["header_symbol_search", "timeframes_toolbar"],
      // saved_data: JSON.parse(localStorage.getItem('savedDrawing'))
    }
    this.tradingViewWidget = null
    this.chartObject = null
    this.state = {
      isChartReady: false,
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
      this.getChartDrawingFromServer()
      this.chartObject = this.tradingViewWidget.activeChart()
      this.chartEvent("drawing_event")
    })
  }

  chartEvent = (event) => {
    if (!this.tradingViewWidget) return
    this.tradingViewWidget.subscribe(event, (obj) => {
      this.saveChartDrawingToServer()
    })
  }

  saveChartDrawingToServer = () => {
    if (!this.tradingViewWidget) return
    this.tradingViewWidget.save((obj) => {
      console.log(`Chart Saved`)
      const str = JSON.stringify(obj.charts[0])
      saveChartDrawing(this.state.email, str)
      // localStorage.setItem('savedDrawing', str)
    })
  }

  changeSymbol = (newSymbol) => {
    if (!newSymbol || !this.tradingViewWidget) return
    const { interval, symbol } = this.tradingViewWidget.symbolInterval()
    this.tradingViewWidget.setSymbol(newSymbol, interval, () => { })
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
    if (!this.tradingViewWidget) return
    try {
      const dt = await getChartDrawing(this.state.email)
      this.tradingViewWidget.load(JSON.parse(dt))
    }
    catch (e) {
      console.log(e)
    }
  }

  componentDidMount() {
    this.tradingViewWidget = (window.tvWidget = new window.TradingView.widget(this.widgetOptions))
    this.chartReady()
  }

  componentDidUpdate() {
    console.log(`In Update`)
    if (this.tradingViewWidget) {
      const { symbol } = this.state
      this.changeSymbol(symbol)
    }
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <div id='chart_container' style={{ width: "100%", height: "100%" }}></div>
    )
  }
}