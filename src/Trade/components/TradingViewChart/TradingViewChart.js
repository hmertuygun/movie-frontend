import React, { useState, useEffect, useContext, Component } from 'react'
import binanceAPI from '../../../api/binanceAPI'
import { getChartDrawing, saveChartDrawing, deleteChartDrawing } from '../../../api/api'
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
      symbol: 'BINANCE:BTCUSDT',
      disabled_features: ["header_symbol_search", "timeframes_toolbar", "header_undo_redo"],
      //saved_data: JSON.parse(localStorage.getItem('savedDrawing'))
    }
    this.tradingViewWidget = null
    this.chartObject = null
    this.state = {
      isChartReady: false,
      symbol: 'BINANCE:BTCUSDT',
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
    this.tradingViewWidget.subscribe(event, (obj) => {
      this.saveChartDrawingToServer()
    })
  }

  saveChartDrawingToServer = () => {
    this.tradingViewWidget.save((obj) => {
      console.log(`Chart Saved`)
      const str = JSON.stringify(obj.charts[0].panes[0])
      // const str = JSON.stringify(obj.charts[0])
      // localStorage.setItem('savedDrawing', str)
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
    }
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
      // const sD = localStorage.getItem('savedDrawing')
      // if (sD) return
      const cData = await getChartDrawing(this.state.email)
      const pData = JSON.parse(cData)
      // this.tradingViewWidget.load(pData)
      // localStorage.setItem('savedDrawing', cData)
      this.tradingViewWidget.save((obj) => {
        const prep = { ...obj.charts[0], panes: [pData] }
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
    }
  }

  componentDidMount() {
    this.tradingViewWidget = (window.tvWidget = new window.TradingView.widget(this.widgetOptions))
    this.chartReady()
  }

  componentDidUpdate() {
    if (!this.tradingViewWidget) return
    console.log(`In Update`)
    this.changeSymbol(this.state.symbol)
  }

  componentWillUnmount() {
  }

  render() {
    const { isChartReady } = this.state
    return (
      <div id='chart_container' style={{ width: "100%", height: "100%", borderTop: '1px solid #bbb', display: isChartReady ? 'block' : 'none' }}></div>
    )
  }
}