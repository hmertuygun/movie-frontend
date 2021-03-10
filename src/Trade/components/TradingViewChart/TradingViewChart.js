import React, { useState, useEffect, useContext, Component } from 'react'
import binanceAPI from '../../../api/binanceAPI'
import { UserContext } from '../../../contexts/UserContext'
const getLocalLanguage = () => {
  return navigator.language.split('-')[0] || 'en'
}
export default class TradingViewChart extends Component {
  constructor({ symbol, theme }) {
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
    }
    this.tradingViewWidget = null
    this.chartObject = null
    this.state = {
      isChartReady: false,
      symbol,
      theme
    }
  }

  static getDerivedStateFromProps(newProps, prevState) {
    if (prevState.symbol !== newProps.symbol || prevState.theme !== newProps.theme) return { ...prevState, ...newProps }
    else return { ...prevState }
  }

  chartReady = () => {
    this.tradingViewWidget.onChartReady(() => {
      this.setState({
        isChartReady: true
      })
    })
  }

  changeSymbol = (newSymbol) => {
    if (!newSymbol || !this.tradingViewWidget) return
    const { interval, symbol } = this.tradingViewWidget.symbolInterval()
    this.tradingViewWidget.setSymbol(newSymbol, interval, () => { })
  }

  componentDidMount() {
    this.tradingViewWidget = (window.tvWidget = new window.TradingView.widget(this.widgetOptions))
    this.chartReady()
  }

  componentDidUpdate() {
    if (this.tradingViewWidget) {
      const { symbol } = this.state
      this.changeSymbol(symbol)
    }
  }

  render() {
    return (
      <div id='chart_container' style={{ width: "100%", height: "100%" }}></div>
    )
  }
}